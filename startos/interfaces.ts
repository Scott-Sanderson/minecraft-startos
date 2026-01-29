import { sdk } from './sdk'
import { gamePort, webAdminPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  // Web Admin Interface
  const webAdminMulti = sdk.MultiHost.of(effects, 'web-admin-multi')
  const webAdminOrigin = await webAdminMulti.bindPort(webAdminPort, {
    protocol: 'http',
  })
  const webAdminInterface = sdk.createInterface(effects, {
    name: 'Web Admin',
    id: 'web-admin',
    description: 'RCON-based web administration interface',
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
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
    secure: null,
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
