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

    const minecraftInterface = await sdk.serviceInterface
      .getOwn(effects, 'minecraft-server')
      .once()

    let output = '# RCON Connection Details\n\n'
    output += 'Use these credentials with external RCON management tools.\n\n'

    if (minecraftInterface?.addressInfo) {
      const preferredHosts = minecraftInterface.addressInfo.nonLocal.filter({
        visibility: 'private',
      }).hostnames
      const fallbackHosts = minecraftInterface.addressInfo.nonLocal.hostnames
      const host = preferredHosts[0]?.hostname ?? fallbackHosts[0]?.hostname
      if (host) output += `**Host:** \`${host}\`\n\n`
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
  },
)
