import { sdk } from '../sdk'
import { gamePort } from '../utils'
import type { T } from '@start9labs/start-sdk'

type AddressResultMember = Extract<T.ActionResultMember, { type: 'single' }>

const connectionLabel = (
  hostname: string,
  kind: T.HostnameMetadata['kind'],
  index: number,
) => {
  switch (kind) {
    case 'mdns':
      return `Local Hostname ${index}`
    case 'private-domain':
      return `Private Domain ${index}`
    case 'public-domain':
      return `Public Domain ${index}`
    case 'ipv4':
      return `IPv4 Address ${index}`
    case 'ipv6':
      return `IPv6 Address ${index}`
    case 'plugin':
      return `Plugin Hostname ${index}`
    default:
      return `Address ${index}`
  }
}

const toAddressMembers = (
  hostnames: Array<T.HostnameInfo>,
): Array<AddressResultMember> => {
  const seen = new Set<string>()
  const members: Array<AddressResultMember> = []

  for (const hostname of hostnames) {
    const address = `${hostname.hostname}:${hostname.port ?? gamePort}`
    if (seen.has(address)) continue
    seen.add(address)
    members.push({
      name: connectionLabel(
        hostname.hostname,
        hostname.metadata.kind,
        members.length + 1,
      ),
      description: null,
      type: 'single',
      value: address,
      copyable: true,
      qr: false,
      masked: false,
    })
  }

  return members
}

export const getConnectionInfo = sdk.Action.withoutInput(
  'get-connection-info',
  async () => ({
    name: 'Get Connection Info',
    description: 'Get copyable connection addresses for the Minecraft server',
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
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

    const lanMembers = toAddressMembers(lanHostnames)
    const publicMembers = toAddressMembers(publicHostnames)

    const resultMembers: Array<T.ActionResultMember> = [
      {
        name: 'Recommended Address',
        description:
          'Use this VM IP and assigned port first when connecting from your local network',
        type: 'single',
        value: preferredAddress,
        copyable: true,
        qr: false,
        masked: false,
      },
      {
        name: 'Host IP',
        description: 'Current StartOS VM IP address',
        type: 'single',
        value: osIp,
        copyable: true,
        qr: false,
        masked: false,
      },
      {
        name: 'Port',
        description: 'Current externally assigned Minecraft port',
        type: 'single',
        value: assignedPort.toString(),
        copyable: true,
        qr: false,
        masked: false,
      },
    ]

    if (lanMembers.length > 0) {
      resultMembers.push({
        name: 'Local Network Addresses',
        description:
          'Addresses other devices on your LAN can usually use directly',
        type: 'group',
        value: lanMembers,
      })
    }

    if (publicMembers.length > 0) {
      resultMembers.push({
        name: 'Public / Routed Addresses',
        description: 'Addresses exposed beyond the local network, if available',
        type: 'group',
        value: publicMembers,
      })
    }

    return {
      version: '1',
      title: 'Connection Information',
      message:
        'Use one of the copyable addresses below in Minecraft Java Edition multiplayer.',
      result: {
        type: 'group',
        value: resultMembers,
      },
    }
  },
)
