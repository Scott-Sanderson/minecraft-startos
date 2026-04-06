import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_26_1_0 = VersionInfo.of({
  version: '26.1:0',
  releaseNotes:
    'Stable release for StartOS with hardened RCON admin startup, backup-safe save flush, improved memory/server settings UX, and whitelist state/file reconciliation fixes.',
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
