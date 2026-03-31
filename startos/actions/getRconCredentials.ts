import type { T } from '@start9labs/start-sdk'
import { normalizeStoreConfig, storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

type SingleResultMember = Extract<T.ActionResultMember, { type: 'single' }>

const internalGatewayIds = new Set(['lo', 'lxcbr0'])

const pickLocalIpAddress = (
  hostnames: Array<T.HostnameInfo>,
): string | null => {
  const ipv4Hostnames = hostnames.filter(
    (hostname) => hostname.metadata.kind === 'ipv4',
  )

  const preferredHostname = ipv4Hostnames.find((hostname) => {
    const metadata = hostname.metadata
    return 'gateway' in metadata && !internalGatewayIds.has(metadata.gateway)
  })

  return preferredHostname?.hostname ?? ipv4Hostnames[0]?.hostname ?? null
}

const credentialsResult = ({
  localIpAddress,
  username,
  password,
}: {
  localIpAddress: string
  username: string
  password: string
}): Array<SingleResultMember> => [
  {
    name: 'Local IP Address',
    description: null,
    type: 'single',
    value: localIpAddress,
    copyable: true,
    qr: false,
    masked: false,
  },
  {
    name: 'Username',
    description: null,
    type: 'single',
    value: username,
    copyable: true,
    qr: false,
    masked: false,
  },
  {
    name: 'Password',
    description: null,
    type: 'single',
    value: password,
    copyable: true,
    qr: false,
    masked: true,
  },
]

export const getRconCredentials = sdk.Action.withoutInput(
  'get-rcon-credentials',
  async () => ({
    name: 'Get RCON Credentials',
    description: 'Get the local login details for the bundled RCON admin tools',
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const config = normalizeStoreConfig(await storeJson.read().once())

    if (!config?.webAdminPassword) {
      return {
        version: '1',
        title: 'Error',
        message: 'RCON credentials have not been initialized yet',
        result: null,
      }
    }

    const minecraftInterface = await sdk.serviceInterface
      .getOwn(effects, 'minecraft-server')
      .once()

    const privateHostnames = minecraftInterface?.addressInfo
      ? minecraftInterface.addressInfo.nonLocal.filter({
          visibility: 'private',
          kind: ['ip'],
        }).hostnames
      : []

    const localIpAddress = pickLocalIpAddress(privateHostnames)

    if (!localIpAddress) {
      return {
        version: '1',
        title: 'Error',
        message: 'A local IP address is not available yet. Please try again.',
        result: null,
      }
    }

    return {
      version: '1',
      title: 'RCON Credentials',
      message: 'Use the copyable values below.',
      result: {
        type: 'group',
        value: credentialsResult({
          localIpAddress,
          username: config.webAdminUsername,
          password: config.webAdminPassword,
        }),
      },
    }
  },
)
