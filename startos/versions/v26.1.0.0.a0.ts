import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_26_1_0_0_a0 = VersionInfo.of({
  version: '26.1:0-alpha.0',
  releaseNotes: {
    en_US: 'Initial release of Minecraft Server for StartOS with RCON Web Admin',
    es_ES:
      'Lanzamiento inicial de Minecraft Server para StartOS con administracion web por RCON',
    de_DE:
      'Erstveroeffentlichung von Minecraft Server fuer StartOS mit RCON-Webverwaltung',
    pl_PL:
      'Pierwsze wydanie Minecraft Server dla StartOS z panelem administracyjnym RCON',
    fr_FR:
      'Version initiale de Minecraft Server pour StartOS avec administration web RCON',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
