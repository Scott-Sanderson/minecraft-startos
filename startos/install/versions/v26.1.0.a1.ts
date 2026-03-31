import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_26_1_0_a1 = VersionInfo.of({
  version: '26.1:0-alpha.1',
  releaseNotes:
    'Pin the RCON sidecar image and stabilize the bundled RCON Web Admin dashboard',
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
