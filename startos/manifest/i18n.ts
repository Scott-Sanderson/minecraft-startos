type Locale = 'en_US' | 'es_ES' | 'de_DE' | 'pl_PL' | 'fr_FR'
type LocalizedText = Record<Locale, string>

export const shortDescription: LocalizedText = {
  en_US: 'Java Edition Minecraft server with web-based management',
  es_ES: 'Servidor de Minecraft Java Edition con gestion web',
  de_DE: 'Minecraft Java Edition Server mit webbasierter Verwaltung',
  pl_PL: 'Serwer Minecraft Java Edition z zarzadzaniem przez WWW',
  fr_FR: 'Serveur Minecraft Java Edition avec gestion web',
}

export const longDescription: LocalizedText = {
  en_US:
    'Minecraft Server is a vanilla Java Edition server with RCON-based web administration, configurable memory, world, gameplay, and idle pause behavior, whitelist management, and persistent world data.',
  es_ES:
    'Minecraft Server es un servidor vanilla de Java Edition con administracion web por RCON, memoria configurable, configuracion de mundo y jugabilidad, pausa en inactividad, gestion de lista blanca y datos persistentes.',
  de_DE:
    'Minecraft Server ist ein Vanilla-Java-Edition-Server mit RCON-basierter Webverwaltung, konfigurierbarem Speicher, Welt- und Gameplay-Einstellungen, Leerlaufpause, Whitelist-Verwaltung und persistenten Weltdaten.',
  pl_PL:
    'Minecraft Server to serwer vanilla Java Edition z panelem WWW opartym o RCON, konfigurowalna pamiecia, ustawieniami swiata i rozgrywki, pauza przy braku graczy, lista biala i trwalymi danymi swiata.',
  fr_FR:
    'Minecraft Server est un serveur vanilla Java Edition avec administration web via RCON, memoire configurable, reglage du monde et du gameplay, pause en inactivite, gestion de liste blanche et donnees persistantes.',
}

export const installAlert: LocalizedText = {
  en_US:
    'Minecraft server installed! Access the Web Admin UI or use actions to get connection details.',
  es_ES:
    'Servidor Minecraft instalado. Abre la interfaz Web Admin o usa las acciones para obtener los datos de conexion.',
  de_DE:
    'Minecraft-Server installiert. Nutze die Web-Admin-Oberflaeche oder Aktionen fuer Verbindungsdetails.',
  pl_PL:
    'Serwer Minecraft zainstalowany. Otworz panel Web Admin lub uzyj akcji, aby pobrac dane polaczenia.',
  fr_FR:
    'Serveur Minecraft installe. Utilisez Web Admin ou les actions pour recuperer les informations de connexion.',
}

export const updateAlert: LocalizedText = {
  en_US: 'Minecraft server updated. Your world data and settings are preserved.',
  es_ES:
    'Servidor Minecraft actualizado. Tus datos del mundo y ajustes se conservaron.',
  de_DE:
    'Minecraft-Server aktualisiert. Deine Weltdaten und Einstellungen wurden beibehalten.',
  pl_PL:
    'Serwer Minecraft zaktualizowany. Dane swiata i ustawienia zostaly zachowane.',
  fr_FR:
    'Serveur Minecraft mis a jour. Vos donnees de monde et parametres sont conserves.',
}

export const uninstallAlert: LocalizedText = {
  en_US:
    'All Minecraft server data, including world saves, will be permanently deleted.',
  es_ES:
    'Todos los datos del servidor Minecraft, incluidos los mundos guardados, se eliminaran permanentemente.',
  de_DE:
    'Alle Minecraft-Serverdaten, einschliesslich Weltspeicherstaende, werden dauerhaft geloescht.',
  pl_PL:
    'Wszystkie dane serwera Minecraft, w tym zapisy swiata, zostana trwale usuniete.',
  fr_FR:
    'Toutes les donnees du serveur Minecraft, y compris les sauvegardes de mondes, seront supprimees definitivement.',
}

export const restoreAlert: LocalizedText = {
  en_US: 'Minecraft server restored from backup.',
  es_ES: 'Servidor Minecraft restaurado desde copia de seguridad.',
  de_DE: 'Minecraft-Server aus Sicherung wiederhergestellt.',
  pl_PL: 'Serwer Minecraft przywrocony z kopii zapasowej.',
  fr_FR: 'Serveur Minecraft restaure depuis une sauvegarde.',
}

export const stopAlert: LocalizedText = {
  en_US: 'Players will be disconnected when the server stops.',
  es_ES: 'Los jugadores se desconectaran cuando el servidor se detenga.',
  de_DE: 'Spieler werden beim Stoppen des Servers getrennt.',
  pl_PL: 'Gracze zostana rozlaczeni po zatrzymaniu serwera.',
  fr_FR: 'Les joueurs seront deconnectes lorsque le serveur s arretera.',
}
