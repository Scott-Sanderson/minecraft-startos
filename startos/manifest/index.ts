import { setupManifest } from '@start9labs/start-sdk'
import { minecraftImageTag, minecraftVersion } from '../utils'
import {
  defaultLocale,
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
  wrapperRepo: 'https://github.com/Scott-Sanderson/minecraft-startos',
  upstreamRepo: 'https://github.com/itzg/docker-minecraft-server',
  supportSite: 'https://github.com/itzg/docker-minecraft-server/issues',
  marketingSite: 'https://www.minecraft.net/',
  donationUrl: null,
  docsUrl: 'https://docker-minecraft-server.readthedocs.io/',
  description: {
    short: shortDescription[defaultLocale],
    long: longDescription[defaultLocale],
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
    install: installAlert[defaultLocale],
    update: updateAlert[defaultLocale],
    uninstall: uninstallAlert[defaultLocale],
    restore: restoreAlert[defaultLocale],
    start: null,
    stop: stopAlert[defaultLocale],
  },
  dependencies: {},
} as unknown as Parameters<typeof setupManifest>[0])
