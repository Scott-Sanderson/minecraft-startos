import { sdk } from '../sdk'
import { normalizeStoreConfig, storeJson } from '../fileModels/store.json'
import { rconPort } from '../utils'

export const getRconCredentials = sdk.Action.withoutInput(
  'get-rcon-credentials',
  async () => ({
    name: 'Get RCON Credentials',
    description: 'Get RCON connection details for external management tools',
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const config = normalizeStoreConfig(await storeJson.read().once())

    if (!config || !config.rconPassword) {
      return {
        version: '1',
        title: 'Error',
        message: 'RCON credentials have not been initialized yet',
        result: null,
      }
    }

    const minecraftInterface = await sdk.serviceInterface.getAllOwn(
      effects,
      (interfaces) => interfaces.find(i => i.id === 'minecraft-server')
    ).once()

    let output = '# RCON Connection Details\n\n'
    output += 'Use these credentials with external RCON management tools.\n\n'

    if (minecraftInterface?.addressInfo) {
      const lanHostnames = minecraftInterface.addressInfo.nonLocal.filter({ kind: ['ipv4', 'ipv6', 'domain'] }).hostnames
      if (lanHostnames.length > 0) {
        const host = lanHostnames[0].kind === 'ip' ? lanHostnames[0].hostname.value : lanHostnames[0].hostname
        output += `**Host:** \`${host}\`\n\n`
      }
    }

    output += `**Port:** \`${rconPort}\`\n\n`
    output += `**Password:** \`${config.rconPassword}\`\n\n`
    output += '---\n\n'
    output += 'Popular RCON tools:\n'
    output += '- mcrcon (command line)\n'
    output += '- Minecraft RCON Console (desktop app)\n'
    output += '- Or use the built-in Web Admin UI\n'

    return {
      version: '1',
      title: 'RCON Credentials',
      message: output,
      result: null,
    }
  }
)
