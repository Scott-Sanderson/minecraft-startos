import { sdk } from './sdk'
import {
  gamePort,
  minecraftVersion,
  rconPort,
  webAdminPort,
  webAdminProxyPort,
  webAdminWsPort,
} from './utils'
import { normalizeStoreConfig, storeJson } from './fileModels/store.json'
import { rm, writeFile } from 'fs/promises'

const rconWebAdminDbPath = '/opt/rcon-web-admin-0.14.1/db'
const minecraftInitialHealthCheckDelay = 5_000
const minecraftHealthGracePeriod = 30_000
const whitelistPath = '/media/startos/volumes/main/whitelist.json'

const delayFirstHealthCheck: typeof sdk.trigger.defaultTrigger =
  async function* (getInput) {
    await new Promise((resolve) =>
      setTimeout(resolve, minecraftInitialHealthCheckDelay),
    )
    yield

    const defaultTrigger = sdk.trigger.defaultTrigger(getInput)
    for (
      let result = await defaultTrigger.next();
      !result.done;
      result = await defaultTrigger.next()
    ) {
      yield result.value
    }
  }

const proxyConfig = ({
  proxyPort,
  upstreamPort,
  websocketPort,
}: {
  proxyPort: number
  upstreamPort: number
  websocketPort: number
}) =>
  `
server {
  listen ${proxyPort};
  server_name _;

  location = /wsconfig {
    default_type application/json;
    return 200 '{"port":${websocketPort},"sslUrl":"wss://$http_host/ws","url":"ws://$http_host/ws"}';
  }

  location = /ws {
    proxy_pass http://127.0.0.1:${websocketPort}/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $http_host;
    proxy_buffering off;
  }

  location /ws/ {
    proxy_pass http://127.0.0.1:${websocketPort}/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $http_host;
    proxy_buffering off;
  }

  location / {
    proxy_pass http://127.0.0.1:${upstreamPort};
    proxy_http_version 1.1;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
`.trimStart()

export const main = sdk.setupMain(async ({ effects }) => {
  const config = normalizeStoreConfig(await storeJson.read().const(effects))

  if (!config || !config.rconPassword || !config.webAdminPassword) {
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
    'minecraft-server-sub',
  )

  // Keep whitelist.json in sync with configured whitelist state.
  if (config.whitelistEnabled) {
    await writeFile(whitelistPath, JSON.stringify(config.whitelist, null, 2))
  } else {
    await rm(whitelistPath, { force: true })
  }

  // RCON Web Admin Daemon
  const rconAdminSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'rcon' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: 'rcon-db',
      mountpoint: rconWebAdminDbPath,
      readonly: false,
    }),
    'rcon-sub',
  )
  const rconProxySub = await sdk.SubContainer.of(
    effects,
    { imageId: 'rcon-proxy' },
    null,
    'rcon-proxy-sub',
  )

  await writeFile(
    `${rconProxySub.rootfs}/etc/nginx/conf.d/default.conf`,
    proxyConfig({
      proxyPort: webAdminProxyPort,
      upstreamPort: webAdminPort,
      websocketPort: webAdminWsPort,
    }),
  )

  return sdk.Daemons.of(effects)
    .addDaemon('minecraft-server', {
      subcontainer: minecraftSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          EULA: 'TRUE',
          TYPE: 'VANILLA',
          VERSION: minecraftVersion,
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
          PAUSE_WHEN_EMPTY_SECONDS: config.pauseWhenEmptySeconds.toString(),
          SERVER_PORT: gamePort.toString(),
        },
      },
      ready: {
        display: 'Minecraft Server',
        gracePeriod: minecraftHealthGracePeriod,
        trigger: delayFirstHealthCheck,
        fn: async () => {
          const minecraftStatus = await sdk.healthCheck.checkPortListening(
            effects,
            gamePort,
            {
              successMessage: 'Minecraft server is ready',
              errorMessage: 'Minecraft server is not ready',
            },
          )

          if (minecraftStatus.result !== 'success') {
            return minecraftStatus
          }

          return sdk.healthCheck.checkPortListening(effects, rconPort, {
            successMessage: 'Minecraft server is ready',
            errorMessage: 'Minecraft server is ready, waiting for RCON',
          })
        },
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
    .addDaemon('rcon-proxy', {
      subcontainer: rconProxySub,
      exec: {
        command: sdk.useEntrypoint(),
      },
      ready: {
        display: 'RCON Web Admin Proxy',
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, webAdminProxyPort, {
            successMessage: 'Web admin proxy is ready',
            errorMessage: 'Web admin proxy is not ready',
          }),
      },
      requires: ['rcon-admin'],
    })
})
