import { sdk } from './sdk'
import { gamePort, webAdminProxyPort } from './utils'
import {
  defaultWebAdminUsername,
  normalizeStoreConfig,
  storeJson,
} from './fileModels/store.json'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const config = normalizeStoreConfig(await storeJson.read().const(effects))

  // Web Admin Interface
  const webAdminMulti = sdk.MultiHost.of(effects, 'web-admin-multi')
  const webAdminOrigin = await webAdminMulti.bindPort(webAdminProxyPort, {
    protocol: 'http',
  })
  const webAdminInterface = sdk.createInterface(effects, {
    name: 'RCON Web Admin',
    id: 'web-admin',
    description: 'RCON-based web administration interface',
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: config?.webAdminUsername ?? defaultWebAdminUsername,
    path: '',
    query: {},
  })
  const webAdminReceipt = await webAdminOrigin.export([webAdminInterface])

  // Minecraft Game Server Interface
  const minecraftMulti = sdk.MultiHost.of(effects, 'minecraft-multi')
  const minecraftOrigin = await minecraftMulti.bindPort(gamePort, {
    protocol: null,
    preferredExternalPort: gamePort,
    addSsl: null,
    secure: { ssl: false },
  })
  const minecraftInterface = sdk.createInterface(effects, {
    name: 'Minecraft Server',
    id: 'minecraft-server',
    description: 'Minecraft game server connection (Java Edition)',
    type: 'p2p',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const minecraftReceipt = await minecraftOrigin.export([minecraftInterface])

  return [webAdminReceipt, minecraftReceipt]
})
