import { utils } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { configureServer } from '../actions/configureServer'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {
    rconPassword: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 32 }),
    webAdminPassword: utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 24,
    }),
  })

  // Create a task prompting user to configure the server
  // This is required before the server can start
  await sdk.action.createOwnTask(effects, configureServer, 'critical', {
    reason: 'Configure your Minecraft server settings before first start',
  })
})
