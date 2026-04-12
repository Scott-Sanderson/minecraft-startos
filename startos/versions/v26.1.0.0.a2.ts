import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_26_1_0_0_a2 = VersionInfo.of({
  version: '26.1:0-alpha.2',
  releaseNotes: {
    en_US:
      'Wrapper update: backup-safe save-all flush, stronger RCON startup sequencing, expanded server settings controls, and finalized whitelist reconciliation behavior.',
    es_ES:
      'Actualizacion del wrapper: save-all flush seguro para copias, secuencia de arranque RCON mas robusta, controles de configuracion ampliados y conciliacion final de whitelist.',
    de_DE:
      'Wrapper-Update: backup-sicheres save-all flush, robustere RCON-Startreihenfolge, erweiterte Servereinstellungen und finalisierte Whitelist-Abgleichslogik.',
    pl_PL:
      'Aktualizacja wrappera: bezpieczne save-all flush przed backupem, mocniejsze sekwencjonowanie startu RCON, rozszerzone ustawienia serwera i finalne uzgadnianie whitelisty.',
    fr_FR:
      'Mise a jour du wrapper : save-all flush sur avant sauvegarde, sequence de demarrage RCON renforcee, controles etendus et reconciliation finale de la whitelist.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
