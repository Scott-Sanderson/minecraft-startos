import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v_26_1_2_0_a1 = VersionInfo.of({
  version: '26.1.2:0-alpha.1',
  releaseNotes: {
    en_US:
      'Wrapper update: remove automatic connection address suggestion, direct users to Interfaces, and clarify setup/status messaging.',
    es_ES:
      'Actualizacion del wrapper: elimina la sugerencia automatica de direccion de conexion, dirige a los usuarios a Interfaces y aclara los mensajes de configuracion/estado.',
    de_DE:
      'Wrapper-Update: automatische Verbindungsempfehlung entfernt, Nutzer auf Interfaces verwiesen und Setup/Status-Texte klarer formuliert.',
    pl_PL:
      'Aktualizacja wrappera: usunieto automatyczna sugestie adresu polaczenia, skierowano uzytkownikow do Interfaces i doprecyzowano komunikaty konfiguracji/statusu.',
    fr_FR:
      'Mise a jour du wrapper : suppression de la suggestion automatique d adresse de connexion, orientation vers Interfaces et clarification des messages de configuration/statut.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
