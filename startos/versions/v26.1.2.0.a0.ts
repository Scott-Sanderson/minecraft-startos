import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_26_1_2_0_a0 = VersionInfo.of({
  version: '26.1.2:0-alpha.0',
  releaseNotes: {
    en_US: 'Update Minecraft upstream release from 26.1 to 26.1.2.',
    es_ES: 'Actualiza la version upstream de Minecraft de 26.1 a 26.1.2.',
    de_DE: 'Aktualisiert das Minecraft-Upstream-Release von 26.1 auf 26.1.2.',
    pl_PL: 'Aktualizuje wersje upstream Minecraft z 26.1 do 26.1.2.',
    fr_FR:
      'Met a jour la version upstream de Minecraft de 26.1 vers 26.1.2.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
