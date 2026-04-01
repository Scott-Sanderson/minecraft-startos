import { Socket } from 'node:net'
import { normalizeStoreConfig, storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { rconPort } from '../utils'

type RconPacket = {
  requestId: number
  type: number
  payload: string
}

const authRequestId = 1
const authPacketType = 3
const commandPacketType = 2

const toSingle = (name: string, value: string, description: string | null = null) => ({
  name,
  description,
  type: 'single' as const,
  value,
  copyable: false,
  qr: false,
  masked: false,
})

const parseInteger = (value: string | null): number | null => {
  if (!value) return null
  const match = value.match(/-?\d+/)
  if (!match) return null
  const parsed = Number.parseInt(match[0], 10)
  return Number.isNaN(parsed) ? null : parsed
}

const parsePlayersInfo = (value: string | null) => {
  if (!value) return { online: null as number | null, max: null as number | null, players: [] as string[] }

  const match = value.match(
    /There are (\d+) of a max of (\d+) players online:?\s*(.*)$/i,
  )

  if (!match) {
    return { online: null as number | null, max: null as number | null, players: [] as string[] }
  }

  const playersRaw = match[3]?.trim() ?? ''
  const players = playersRaw
    ? playersRaw.split(/\s*,\s*/).filter((player) => player.length > 0)
    : []

  return {
    online: Number.parseInt(match[1], 10),
    max: Number.parseInt(match[2], 10),
    players,
  }
}

const parseValueFromSentence = (
  value: string | null,
  regex: RegExp,
): string | null => {
  if (!value) return null
  const match = value.match(regex)
  return match?.[1] ?? null
}

const normalizeDaytimeTicks = (ticks: number): number =>
  ((ticks % 24_000) + 24_000) % 24_000

const describeTimeOfDay = (ticks: number | null): string => {
  if (ticks === null) return 'Unavailable'

  const normalized = normalizeDaytimeTicks(ticks)

  if (normalized < 1_000) return '☀ Sunrise'
  if (normalized < 6_000) return '☀ Morning'
  if (normalized < 12_000) return '☀ Day'
  if (normalized < 13_000) return '🌙 Dusk'
  if (normalized < 18_000) return '🌙 Night'
  if (normalized < 23_000) return '🌙 Midnight'
  return '☀ Sunrise'
}

const toMinecraftClock = (ticks: number | null): string | null => {
  if (ticks === null) return null

  const normalized = normalizeDaytimeTicks(ticks)
  const totalHours = (normalized / 1_000 + 6) % 24
  const hours = Math.floor(totalHours)
  const minutes = Math.floor((totalHours - hours) * 60)

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}`
}

const describeMoonPhase = (worldDay: number | null): string => {
  if (worldDay === null) return 'Unavailable'

  const phase = ((worldDay % 8) + 8) % 8
  const phases = [
    '🌕 Full Moon',
    '🌖 Waning Gibbous',
    '🌗 Last Quarter',
    '🌘 Waning Crescent',
    '🌑 New Moon',
    '🌒 Waxing Crescent',
    '🌓 First Quarter',
    '🌔 Waxing Gibbous',
  ]

  return phases[phase]
}

const encodePacket = (requestId: number, type: number, payload: string) => {
  const payloadBuffer = Buffer.from(payload, 'utf8')
  const packetSize = 4 + 4 + payloadBuffer.length + 2
  const buffer = Buffer.alloc(packetSize + 4)

  buffer.writeInt32LE(packetSize, 0)
  buffer.writeInt32LE(requestId, 4)
  buffer.writeInt32LE(type, 8)
  payloadBuffer.copy(buffer, 12)
  buffer.writeInt16LE(0, 12 + payloadBuffer.length)

  return buffer
}

class RconConnection {
  private readBuffer = Buffer.alloc(0)
  private nextRequestId = 2

  private constructor(
    private readonly socket: Socket,
    public readonly host: string,
    public readonly port: number,
  ) {}

  static async connect(host: string, port: number, timeoutMs: number) {
    const socket = new Socket()

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.destroy()
        reject(
          new Error(`Timed out connecting to RCON at ${host}:${port}`),
        )
      }, timeoutMs)

      socket.once('error', (error) => {
        clearTimeout(timeout)
        reject(new Error(`Failed to connect to RCON at ${host}:${port}: ${error.message}`))
      })

      socket.connect(port, host, () => {
        clearTimeout(timeout)
        socket.removeAllListeners('error')
        resolve()
      })
    })

    socket.setNoDelay(true)
    return new RconConnection(socket, host, port)
  }

  private tryParsePacket(): RconPacket | null {
    if (this.readBuffer.length < 4) return null

    const packetSize = this.readBuffer.readInt32LE(0)
    const frameSize = packetSize + 4

    if (packetSize < 10) {
      throw new Error('Received malformed RCON packet')
    }

    if (this.readBuffer.length < frameSize) return null

    const frame = this.readBuffer.subarray(0, frameSize)
    this.readBuffer = this.readBuffer.subarray(frameSize)

    const requestId = frame.readInt32LE(4)
    const type = frame.readInt32LE(8)
    const payloadBytes = frame.subarray(12, frame.length - 2)
    const payload = payloadBytes.toString('utf8').replace(/\u0000+$/g, '')

    return { requestId, type, payload }
  }

  private async readPacket(timeoutMs: number): Promise<RconPacket> {
    const immediate = this.tryParsePacket()
    if (immediate) return immediate

    return await new Promise<RconPacket>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeout)
        this.socket.off('data', onData)
        this.socket.off('error', onError)
        this.socket.off('close', onClose)
      }

      const onData = (chunk: Buffer) => {
        try {
          this.readBuffer = Buffer.concat([this.readBuffer, chunk])
          const packet = this.tryParsePacket()
          if (!packet) return
          cleanup()
          resolve(packet)
        } catch (error) {
          cleanup()
          reject(
            error instanceof Error
              ? error
              : new Error('Failed to parse RCON packet'),
          )
        }
      }

      const onError = (error: Error) => {
        cleanup()
        reject(new Error(`RCON socket error: ${error.message}`))
      }

      const onClose = () => {
        cleanup()
        reject(new Error('RCON connection closed unexpectedly'))
      }

      const timeout = setTimeout(() => {
        cleanup()
        reject(new Error('Timed out waiting for RCON response'))
      }, timeoutMs)

      this.socket.on('data', onData)
      this.socket.once('error', onError)
      this.socket.once('close', onClose)
      onData(Buffer.alloc(0))
    })
  }

  private sendPacket(requestId: number, type: number, payload: string) {
    this.socket.write(encodePacket(requestId, type, payload))
  }

  private async waitForRequestId(
    requestId: number,
    timeoutMs: number,
  ): Promise<RconPacket> {
    const deadline = Date.now() + timeoutMs

    while (true) {
      const remaining = deadline - Date.now()
      if (remaining <= 0) {
        throw new Error('Timed out waiting for matching RCON response')
      }

      const packet = await this.readPacket(remaining)
      if (packet.requestId === -1 || packet.requestId === requestId) {
        return packet
      }
    }
  }

  async authenticate(password: string, timeoutMs: number) {
    this.sendPacket(authRequestId, authPacketType, password)
    const packet = await this.waitForRequestId(authRequestId, timeoutMs)

    if (packet.requestId === -1) {
      throw new Error('RCON authentication failed')
    }
  }

  async command(command: string, timeoutMs = 3_000): Promise<string> {
    const requestId = this.nextRequestId++
    this.sendPacket(requestId, commandPacketType, command)

    const firstPacket = await this.waitForRequestId(requestId, timeoutMs)
    if (firstPacket.requestId === -1) {
      throw new Error(`RCON command failed: ${command}`)
    }

    const responses: string[] = []
    const firstPayload = firstPacket.payload.trim()
    if (firstPayload) responses.push(firstPayload)

    const drainDeadline = Date.now() + 150
    while (true) {
      const remaining = drainDeadline - Date.now()
      if (remaining <= 0) break

      try {
        const packet = await this.readPacket(remaining)
        if (packet.requestId !== requestId) continue
        const payload = packet.payload.trim()
        if (payload) responses.push(payload)
      } catch {
        break
      }
    }

    return responses.join('\n').trim()
  }

  close() {
    this.socket.destroy()
  }
}

export const getLiveServerStats = sdk.Action.withoutInput(
  'get-live-server-stats',
  async () => ({
    name: 'Get Live Server Stats',
    description: 'Show live player and world stats from the running server',
    warning: null,
    allowedStatuses: 'only-running',
    group: '\u00A0Info',
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const config = normalizeStoreConfig(await storeJson.read().once())

    if (!config?.rconPassword) {
      return {
        version: '1',
        title: 'Error',
        message: 'RCON password is not configured yet.',
        result: null,
      }
    }

    const hostCandidates = ['127.0.0.1']
    const [containerIp, osIp] = await Promise.all([
      effects.getContainerIp({}).catch(() => null),
      effects.getOsIp().catch(() => null),
    ])

    for (const maybeHost of [containerIp, osIp]) {
      if (maybeHost && !hostCandidates.includes(maybeHost)) {
        hostCandidates.push(maybeHost)
      }
    }

    let connection: RconConnection | null = null
    let lastError = 'Unknown connection error'

    for (const host of hostCandidates) {
      try {
        const candidate = await RconConnection.connect(host, rconPort, 2_500)
        await candidate.authenticate(config.rconPassword, 2_500)
        connection = candidate
        break
      } catch (error) {
        lastError =
          error instanceof Error ? error.message : 'Unknown connection error'
      }
    }

    if (!connection) {
      return {
        version: '1',
        title: 'Unable to Fetch Live Stats',
        message: `Could not connect to RCON. ${lastError}`,
        result: null,
      }
    }

    const unavailableStats: string[] = []
    const runCommand = async (label: string, command: string) => {
      try {
        return await connection.command(command)
      } catch {
        unavailableStats.push(label)
        return null
      }
    }

    try {
      // RCON request/response ordering is stateful per socket.
      // Run these commands sequentially so reads cannot race each other.
      const playersOutput = await runCommand('player list', 'list')
      const dayOutput = await runCommand('world day', 'time query day')
      const daytimeOutput = await runCommand('time of day', 'time query daytime')
      const gameTimeOutput = await runCommand('game time', 'time query gametime')

      const players = parsePlayersInfo(playersOutput)
      const worldDayFromDay = parseInteger(dayOutput)
      const gameTime = parseInteger(gameTimeOutput)
      const worldDay =
        worldDayFromDay ?? (gameTime !== null ? Math.floor(gameTime / 24_000) : null)
      const daytimeFromQuery = parseInteger(daytimeOutput)
      const daytimeTicks =
        daytimeFromQuery ??
        (gameTime !== null ? normalizeDaytimeTicks(gameTime) : null)
      const clock = toMinecraftClock(daytimeTicks)

      return {
        version: '1',
        title: 'Live Server Stats',
        message:
          unavailableStats.length > 0
            ? `Some stats were unavailable: ${unavailableStats.join(', ')}.`
            : 'Live data fetched via RCON.',
        result: {
          type: 'group',
          value: [
            toSingle(
              'Players Online',
              players.online !== null && players.max !== null
                ? `${players.online}/${players.max}`
                : 'Unavailable',
            ),
            toSingle(
              'Connected Players',
              players.online === 0
                ? 'None'
                : players.players.length > 0
                  ? players.players.join(', ')
                  : 'Unavailable',
            ),
            toSingle('Time of Day', describeTimeOfDay(daytimeTicks)),
            toSingle(
              'In-Game Clock',
              clock ? `${clock}` : 'Unavailable',
              'Minecraft day starts at 06:00',
            ),
            toSingle(
              'Daytime Ticks',
              daytimeTicks !== null ? daytimeTicks.toString() : 'Unavailable',
            ),
            toSingle(
              'World Day',
              worldDay !== null ? worldDay.toString() : 'Unavailable',
            ),
            toSingle('Moon Phase', describeMoonPhase(worldDay)),
          ],
        },
      }
    } finally {
      connection.close()
    }
  },
)
