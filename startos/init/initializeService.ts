import { utils } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { configureServer } from '../actions/configureServer'
import { createWorld } from '../actions/createWorld'
import { getConnectionInfo } from '../actions/getConnectionInfo'
import { getWebAdminCredentials } from '../actions/getWebAdminCredentials'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  if (kind === 'install') {
    await storeJson.merge(effects, {
      rconPassword: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 32 }),
      webAdminPassword: utils.getDefaultString({
        charset: 'a-z,A-Z,0-9',
        len: 24,
      }),
    })
  }

  await sdk.action.createOwnTask(
    effects,
    configureServer,
    kind === 'install' ? 'critical' : 'important',
    {
      reason:
        kind === 'install'
          ? 'Configure your Minecraft server settings before first start'
          : 'Review or update your Minecraft server settings',
      replayId: 'minecraft-configure-server',
    },
  )

  if (kind === 'install') {
    await sdk.action.createOwnTask(effects, createWorld, 'important', {
      reason: 'Choose your initial world name and optional seed before first start',
      replayId: 'minecraft-create-initial-world',
    })
  }

  await sdk.action.createOwnTask(effects, getWebAdminCredentials, 'important', {
    reason: 'Retrieve your web admin credentials',
    replayId: 'minecraft-web-admin-credentials',
  })

  await sdk.action.createOwnTask(effects, getConnectionInfo, 'optional', {
    reason: 'Retrieve the Minecraft address and port for your clients',
    replayId: 'minecraft-connection-info',
  })
})
