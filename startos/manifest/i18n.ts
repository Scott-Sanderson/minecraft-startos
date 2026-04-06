export const defaultLocale = 'en_US' as const

type LocalizedText = Record<typeof defaultLocale, string>

export const shortDescription: LocalizedText = {
  en_US: 'Java Edition Minecraft server with web-based management',
}

export const longDescription: LocalizedText = {
  en_US:
    'Minecraft Server is a vanilla Java Edition server with RCON-based web administration, configurable memory, world, gameplay, and idle pause behavior, whitelist management, and persistent world data.',
}

export const installAlert: LocalizedText = {
  en_US:
    'Minecraft server installed! Access the Web Admin UI or use actions to get connection details.',
}

export const updateAlert: LocalizedText = {
  en_US:
    'Minecraft server updated. Your world data and settings are preserved.',
}

export const uninstallAlert: LocalizedText = {
  en_US:
    'All Minecraft server data, including world saves, will be permanently deleted.',
}

export const restoreAlert: LocalizedText = {
  en_US: 'Minecraft server restored from backup.',
}

export const stopAlert: LocalizedText = {
  en_US: 'Players will be disconnected when the server stops.',
}
