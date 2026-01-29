import { sdk } from './sdk'
import { gamePort, rconPort, webAdminPort } from './utils'
import { storeJson } from './fileModels/store.json'
import { writeFile } from 'fs/promises'

export const main = sdk.setupMain(async ({ effects }) => {
  const config = await storeJson.read((s) => s).const(effects)

  if (!config) {
    throw new Error('Configuration not found. Please restart the service.')
  }

  // Minecraft Server Daemon
  const minecraftSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'minecraft-server' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'minecraft-server-sub'
  )

  // Write whitelist.json if enabled (to volume for persistence)
  if (config.whitelistEnabled && config.whitelist.length > 0) {
    await writeFile(
      '/media/startos/volumes/main/whitelist.json',
      JSON.stringify(config.whitelist, null, 2)
    )
  }

  // RCON Web Admin Daemon
  const rconAdminSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'rcon' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: 'rcon-db',
      mountpoint: '/opt/rcon/db',
      readonly: false,
    }),
    'rcon-sub'
  )

  return sdk.Daemons.of(effects)
    .addDaemon('minecraft-server', {
      subcontainer: minecraftSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          EULA: 'TRUE',
          TYPE: 'VANILLA',
          VERSION: 'LATEST',
          MODE: config.gameMode,
          DIFFICULTY: config.difficulty,
          INIT_MEMORY: config.memory.initial,
          MAX_MEMORY: config.memory.maximum,
          ENABLE_RCON: 'true',
          RCON_PASSWORD: config.rconPassword,
          RCON_PORT: rconPort.toString(),
          ENABLE_WHITELIST: config.whitelistEnabled ? 'true' : 'false',
          MOTD: config.motd,
          MAX_PLAYERS: config.maxPlayers.toString(),
          SERVER_PORT: gamePort.toString(),
        },
      },
      ready: {
        display: 'Minecraft Server',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, gamePort, {
            successMessage: 'Minecraft server is ready',
            errorMessage: 'Minecraft server is not ready',
          }),
      },
      requires: [],
    })
    .addDaemon('rcon-admin', {
      subcontainer: rconAdminSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          RWA_USERNAME: config.webAdminUsername,
          RWA_PASSWORD: config.webAdminPassword,
          RWA_ADMIN: 'TRUE',
          RWA_RCON_HOST: 'localhost',
          RWA_RCON_PORT: rconPort.toString(),
          RWA_RCON_PASSWORD: config.rconPassword,
        },
      },
      ready: {
        display: 'RCON Web Admin',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, webAdminPort, {
            successMessage: 'Web admin is ready',
            errorMessage: 'Web admin is not ready',
          }),
      },
      requires: ['minecraft-server'],
    })
})
