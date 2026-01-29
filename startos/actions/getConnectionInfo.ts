import { sdk } from '../sdk'
import { gamePort } from '../utils'

export const getConnectionInfo = sdk.Action.withoutInput(
  'get-connection-info',
  async () => ({
    name: 'Get Connection Info',
    description: 'Get LAN and Tor addresses for connecting to the Minecraft server',
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const minecraftInterface = await sdk.serviceInterface.getAllOwn(
      effects,
      (interfaces) => interfaces.find(i => i.id === 'minecraft-server')
    ).once()

    if (!minecraftInterface) {
      return {
        version: '1',
        title: 'Error',
        message: 'Minecraft server interface not found. Please restart the service.',
        result: null,
      }
    }

    let output = '# Minecraft Server Connection Info\n\n'

    if (minecraftInterface?.addressInfo) {
      const lanHostnames = minecraftInterface.addressInfo.nonLocal.filter({ kind: ['ipv4', 'ipv6', 'domain'] }).hostnames
      const torHostnames = minecraftInterface.addressInfo.onion.hostnames

      if (lanHostnames.length > 0) {
        output += '## LAN Addresses (Local Network)\n\n'
        for (const h of lanHostnames) {
          const host = h.kind === 'ip' ? h.hostname.value : h.hostname
          output += `- \`${host}:${gamePort}\`\n`
        }
        output += '\n'
      }

      if (torHostnames.length > 0) {
        output += '## Tor Address (Private)\n\n'
        for (const h of torHostnames) {
          output += `- \`${h.hostname}:${gamePort}\`\n`
        }
        output += '\n'
      }
    }

    output += '## How to Connect\n\n'
    output += '1. Open Minecraft Java Edition\n'
    output += '2. Go to "Multiplayer"\n'
    output += '3. Click "Add Server"\n'
    output += '4. Enter one of the addresses above (with port)\n'
    output += '5. Click "Done" and connect to your server\n'

    return {
      version: '1',
      title: 'Connection Information',
      message: output,
      result: null,
    }
  }
)
