import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { getRandomString } from '../utils'
import { getWebAdminCredentials } from '../actions/getWebAdminCredentials'
import { getConnectionInfo } from '../actions/getConnectionInfo'

export const initializeService = sdk.setupOnInit(
  async (effects, kind) => {
    if (kind !== 'install') return

    const rconPassword = getRandomString({ charset: 'alphanumeric', len: 32 })
    const webAdminPassword = getRandomString({ charset: 'alphanumeric', len: 24 })

    await storeJson.write(effects, {
      rconPassword,
      gameMode: 'survival',
      difficulty: 'normal',
      memory: { initial: '1G', maximum: '2G' },
      whitelistEnabled: false,
      whitelist: [],
      webAdminUsername: 'admin',
      webAdminPassword,
      motd: 'A Minecraft Server on StartOS',
      maxPlayers: 20,
    })

    // Create tasks prompting user to retrieve credentials and connection info
    await sdk.action.createOwnTask(effects, getWebAdminCredentials, 'critical', {
      reason: 'Retrieve Web Admin credentials to manage your server',
    })

    await sdk.action.createOwnTask(effects, getConnectionInfo, 'critical', {
      reason: 'Get connection details to join your Minecraft server',
    })
  }
)
