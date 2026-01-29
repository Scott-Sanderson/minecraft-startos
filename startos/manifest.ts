import { setupManifest } from '@start9labs/start-sdk'

export const manifest = setupManifest({
  id: 'minecraft',
  title: 'Minecraft Server',
  license: 'Various',
  wrapperRepo: 'https://github.com/Scott-Sanderson/minecraft-startos',
  upstreamRepo: 'https://github.com/itzg/docker-minecraft-server',
  supportSite: 'https://github.com/itzg/docker-minecraft-server/issues',
  marketingSite: 'https://www.minecraft.net/',
  donationUrl: null,
  docsUrl: 'https://docker-minecraft-server.readthedocs.io/',
  description: {
    short: 'Java Edition Minecraft server with web-based management',
    long: 'Minecraft Server is a vanilla Java Edition server with RCON-based web administration, configurable memory, whitelist management, and persistent world data.',
  },
  volumes: ['main'],
  images: {
    'minecraft-server': {
      source: { dockerTag: 'itzg/minecraft-server:latest' },
    },
    'rcon': {
      source: { dockerTag: 'itzg/rcon:latest' },
    },
  },
  alerts: {
    install: 'Minecraft server installed! Access the Web Admin UI or use actions to get connection details.',
    update: 'Minecraft server updated. Your world data and settings are preserved.',
    uninstall: 'All Minecraft server data, including world saves, will be permanently deleted.',
    restore: 'Minecraft server restored from backup.',
    start: null,
    stop: 'Players will be disconnected when the server stops.',
  },
  dependencies: {},
})
