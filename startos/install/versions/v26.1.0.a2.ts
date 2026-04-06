import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_26_1_0_a2 = VersionInfo.of({
  version: '26.1:0-alpha.2',
  releaseNotes:
    'Wrapper update: backup-safe save-all flush, stronger RCON startup sequencing, expanded server settings controls, and finalized whitelist reconciliation behavior.',
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
