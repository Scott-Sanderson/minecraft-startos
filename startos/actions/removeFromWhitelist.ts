import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  name: Value.text({
    name: 'Player Name',
    description: 'Minecraft username to remove from whitelist',
    required: true,
    default: '',
    placeholder: 'Steve',
    masked: false,
  }),
})

export const removeFromWhitelist = sdk.Action.withInput(
  'remove-from-whitelist',
  async () => ({
    name: 'Remove from Whitelist',
    description: 'Remove a player from the server whitelist (requires restart)',
    warning: 'The server will restart to apply whitelist changes.',
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async () => undefined,
  async ({ effects, input }) => {
    const currentConfig = await storeJson.read().once()

    if (!currentConfig) {
      return {
        version: '1',
        title: 'Error',
        message: 'Configuration not found',
        result: null,
      }
    }

    // Check if player exists
    const existingPlayer = currentConfig.whitelist.find(p => p.name === input.name)
    if (!existingPlayer) {
      return {
        version: '1',
        title: 'Player Not Found',
        message: `${input.name} is not on the whitelist.`,
        result: null,
      }
    }

    // Remove player from whitelist
    const updatedWhitelist = currentConfig.whitelist.filter(p => p.name !== input.name)

    await storeJson.write(effects, {
      ...currentConfig,
      whitelist: updatedWhitelist,
    })

    return {
      version: '1',
      title: 'Player Removed from Whitelist',
      message: 'The server will restart to apply the whitelist changes.',
      result: {
        type: 'single',
        value: `${input.name} has been removed from the whitelist.`,
        copyable: false,
        qr: false,
        masked: false,
      },
    }
  }
)
