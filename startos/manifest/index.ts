import { setupManifest } from '@start9labs/start-sdk'
import { minecraftImageTag, minecraftVersion } from '../utils'
import {
  installAlert,
  longDescription,
  restoreAlert,
  shortDescription,
  stopAlert,
  uninstallAlert,
  updateAlert,
} from './i18n'

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
    short: shortDescription,
    long: longDescription,
  },
  volumes: ['main'],
  images: {
    'minecraft-server': {
      source: { dockerTag: `itzg/minecraft-server:${minecraftImageTag}` },
      arch: ['aarch64'],
    },
    'rcon': {
      source: { dockerTag: 'itzg/rcon:latest' },
      arch: ['aarch64'],
    },
  },
  alerts: {
    install: installAlert,
    update: updateAlert,
    uninstall: uninstallAlert,
    restore: restoreAlert,
    start: null,
    stop: stopAlert,
  },
  dependencies: {},
})
