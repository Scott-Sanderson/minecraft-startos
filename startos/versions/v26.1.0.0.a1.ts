import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_26_1_0_0_a1 = VersionInfo.of({
  version: '26.1:0-alpha.1',
  releaseNotes: {
    en_US:
      'Pin the RCON sidecar image and stabilize the bundled RCON Web Admin dashboard',
    es_ES:
      'Fija la imagen del sidecar RCON y estabiliza el panel Web Admin integrado',
    de_DE:
      'Fixiert das RCON-Sidecar-Image und stabilisiert das gebuendelte RCON-Web-Admin-Dashboard',
    pl_PL:
      'Przypina obraz sidecara RCON i stabilizuje dolaczony panel RCON Web Admin',
    fr_FR:
      'Epingle l image sidecar RCON et stabilise le tableau de bord Web Admin integre',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
