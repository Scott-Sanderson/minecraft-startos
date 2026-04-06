import { sdk } from '../sdk'
import { normalizeStoreConfig, storeJson } from '../fileModels/store.json'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  name: Value.text({
    name: 'Player Name',
    description: 'Minecraft username to whitelist',
    required: true,
    default: '',
    placeholder: 'Steve',
    masked: false,
  }),
  uuid: Value.text({
    name: 'Player UUID (Optional)',
    description: 'Minecraft player UUID (optional, leave blank if unknown)',
    required: false,
    default: '',
    placeholder: '',
    masked: false,
  }),
})

export const addToWhitelist = sdk.Action.withInput(
  'add-to-whitelist',
  async () => ({
    name: 'Add to Whitelist',
    description: 'Add a player to the server whitelist (requires restart)',
    warning: 'The server will restart to apply whitelist changes.',
    allowedStatuses: 'any',
    group: '\u200bWhitelist',
    visibility: 'enabled',
  }),
  inputSpec,
  async () => undefined,
  async ({ effects, input }) => {
    const currentConfig = normalizeStoreConfig(await storeJson.read().once())

    if (!currentConfig) {
      return {
        version: '1',
        title: 'Error',
        message: 'Configuration not found',
        result: null,
      }
    }

    // Check if player already exists
    const existingPlayer = currentConfig.whitelist.find(
      (p) => p.name === input.name,
    )
    if (existingPlayer) {
      return {
        version: '1',
        title: 'Player Already Whitelisted',
        message: `${input.name} is already on the whitelist.`,
        result: null,
      }
    }

    // Add player to whitelist
    const updatedWhitelist = [
      ...currentConfig.whitelist,
      { name: input.name, uuid: input.uuid || undefined },
    ]

    await storeJson.merge(effects, {
      whitelist: updatedWhitelist,
      whitelistEnabled: true,
    })

    return {
      version: '1',
      title: 'Player Added to Whitelist',
      message:
        'The server will restart to apply the whitelist changes. Whitelist has been automatically enabled.',
      result: {
        type: 'group',
        value: [
          {
            name: 'Player Name',
            description: null,
            type: 'single' as const,
            value: input.name,
            copyable: false,
            qr: false,
            masked: false,
          },
          ...(input.uuid
            ? [
                {
                  name: 'Player UUID',
                  description: null,
                  type: 'single' as const,
                  value: input.uuid,
                  copyable: false,
                  qr: false,
                  masked: false,
                },
              ]
            : []),
        ],
      },
    }
  },
)
