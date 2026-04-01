import { sdk } from '../sdk'
import { gamePort } from '../utils'
import type { T } from '@start9labs/start-sdk'

const toAddress = (hostname: T.HostnameInfo, fallbackPort: number) =>
  `${hostname.hostname}:${hostname.port ?? fallbackPort}`

const pickPrimaryHostname = (
  lanHostnames: Array<T.HostnameInfo>,
  publicHostnames: Array<T.HostnameInfo>,
) =>
  lanHostnames.find((hostname) => hostname.metadata.kind === 'ipv4') ??
  lanHostnames.find((hostname) => hostname.metadata.kind === 'mdns') ??
  lanHostnames.find((hostname) => hostname.metadata.kind === 'private-domain') ??
  publicHostnames.find((hostname) => hostname.metadata.kind === 'public-domain') ??
  publicHostnames.find((hostname) => hostname.metadata.kind === 'ipv4') ??
  lanHostnames[0] ??
  publicHostnames[0] ??
  null

export const getConnectionInfo = sdk.Action.withoutInput(
  'get-connection-info',
  async () => ({
    name: 'Get Connection Info',
    description: 'Get the best copyable server address for Minecraft',
    warning: null,
    allowedStatuses: 'only-running',
    group: '\u00A0Info',
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const [minecraftInterface, osIp, portForward] = await Promise.all([
      sdk.serviceInterface.getOwn(effects, 'minecraft-server').once(),
      effects.getOsIp(),
      effects.getServicePortForward({
        hostId: 'minecraft-multi',
        internalPort: gamePort,
      }),
    ])

    const assignedPort = portForward.assignedPort ?? gamePort
    const preferredAddress = `${osIp}:${assignedPort}`
    const lanHostnames = minecraftInterface?.addressInfo
      ? minecraftInterface.addressInfo.nonLocal.filter({
          visibility: 'private',
          kind: ['ip', 'domain', 'mdns'],
        }).hostnames
      : []
    const publicHostnames = minecraftInterface?.addressInfo
      ? minecraftInterface.addressInfo.nonLocal.filter({
          visibility: 'public',
        }).hostnames
      : []

    const primaryHostname = pickPrimaryHostname(lanHostnames, publicHostnames)
    const primaryAddress = primaryHostname
      ? toAddress(primaryHostname, assignedPort)
      : preferredAddress

    return {
      version: '1',
      title: 'Connection Information',
      message: 'Use this address in Minecraft Java Edition multiplayer.',
      result: {
        type: 'group',
        value: [
          {
            name: 'Server Address',
            description:
              primaryHostname?.metadata.kind === 'mdns'
                ? 'Best available local hostname for connecting on your LAN'
                : 'Best available address for connecting on your LAN',
            type: 'single',
            value: primaryAddress,
            copyable: true,
            qr: false,
            masked: false,
          },
        ],
      },
    }
  },
)
