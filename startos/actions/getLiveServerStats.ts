import { sdk } from '../sdk'
import { connectToRcon } from '../rcon'

const toSingle = (
  name: string,
  value: string,
  description: string | null = null,
) => ({
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
  if (!value) {
    return {
      online: null as number | null,
      max: null as number | null,
      players: [] as string[],
    }
  }

  const match = value.match(
    /There are (\d+) of a max of (\d+) players online:?\s*(.*)$/i,
  )

  if (!match) {
    return {
      online: null as number | null,
      max: null as number | null,
      players: [] as string[],
    }
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
    const rcon = await connectToRcon(effects)
    if (!rcon.connection) {
      return {
        version: '1',
        title: 'Unable to Fetch Live Stats',
        message: rcon.error,
        result: null,
      }
    }

    const connection = rcon.connection
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
