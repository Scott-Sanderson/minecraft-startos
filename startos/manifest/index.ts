import { setupManifest } from '@start9labs/start-sdk'
import { minecraftImageTag } from '../utils'
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
  license: 'Apache-2.0',
  packageRepo: 'https://github.com/Scott-Sanderson/minecraft-startos',
  upstreamRepo: 'https://github.com/itzg/docker-minecraft-server',
  marketingUrl: 'https://www.minecraft.net/',
  donationUrl: null,
  docsUrls: ['https://docker-minecraft-server.readthedocs.io/'],
  description: {
    short: shortDescription,
    long: longDescription,
  },
  volumes: ['main'],
  images: {
    'minecraft-server': {
      source: { dockerTag: `itzg/minecraft-server:${minecraftImageTag}` },
      arch: ['x86_64', 'aarch64'],
    },
    rcon: {
      source: { dockerBuild: { dockerfile: './rcon.Dockerfile' } },
      arch: ['x86_64', 'aarch64'],
    },
    'rcon-proxy': {
      source: { dockerTag: 'nginx:1.27-alpine' },
      arch: ['x86_64', 'aarch64'],
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
