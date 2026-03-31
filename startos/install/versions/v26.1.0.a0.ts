import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_26_1_0_a0 = VersionInfo.of({
  version: '26.1:0-alpha.0',
  releaseNotes:
    'Initial release of Minecraft Server for StartOS with RCON Web Admin',
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
