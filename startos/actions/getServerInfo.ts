import { sdk } from '../sdk'
import { normalizeStoreConfig, storeJson } from '../fileModels/store.json'

export const getServerInfo = sdk.Action.withoutInput(
  'get-server-info',
  async () => ({
    name: 'Get Server Info',
    description: 'Display current server configuration and settings',
    warning: null,
    allowedStatuses: 'only-running',
    group: '\u00A0Info',
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const config = normalizeStoreConfig(await storeJson.read().once())

    if (!config) {
      return {
        version: '1',
        title: 'Error',
        message: 'Configuration not found',
        result: null,
      }
    }

    return {
      version: '1',
      title: 'Server Configuration',
      message: null,
      result: {
        type: 'group',
        value: [
          {
            name: 'Game Mode',
            description: null,
            type: 'single' as const,
            value: config.gameMode,
            copyable: false,
            qr: false,
            masked: false,
          },
          {
            name: 'Difficulty',
            description: null,
            type: 'single' as const,
            value: config.difficulty,
            copyable: false,
            qr: false,
            masked: false,
          },
          {
            name: 'Memory Allocation',
            description: null,
            type: 'single' as const,
            value: `${config.memory.initial} to ${config.memory.maximum}`,
            copyable: false,
            qr: false,
            masked: false,
          },
          {
            name: 'Message of the Day',
            description: null,
            type: 'single' as const,
            value: config.motd,
            copyable: false,
            qr: false,
            masked: false,
          },
          {
            name: 'Max Players',
            description: null,
            type: 'single' as const,
            value: config.maxPlayers.toString(),
            copyable: false,
            qr: false,
            masked: false,
          },
          {
            name: 'Whitelist Enabled',
            description: null,
            type: 'single' as const,
            value: config.whitelistEnabled ? 'Yes' : 'No',
            copyable: false,
            qr: false,
            masked: false,
          },
          {
            name: 'Whitelisted Players',
            description: null,
            type: 'single' as const,
            value:
              config.whitelist.length > 0
                ? config.whitelist.map((p) => p.name).join(', ')
                : 'None',
            copyable: false,
            qr: false,
            masked: false,
          },
        ],
      },
    }
  },
)
