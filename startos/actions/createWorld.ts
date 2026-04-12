import { sdk } from '../sdk'
import { normalizeStoreConfig, storeJson } from '../fileModels/store.json'
import { listWorldNames } from '../worlds'

const { InputSpec, Value } = sdk

const maxWorldNameLength = 128
const invalidWorldNamePattern = /[\/\\\0]/

const isValidWorldName = (worldName: string): boolean =>
  worldName.length > 0 &&
  worldName.length <= maxWorldNameLength &&
  worldName !== '.' &&
  worldName !== '..' &&
  !invalidWorldNamePattern.test(worldName)

const inputSpec = InputSpec.of({
  worldName: Value.text({
    name: 'New World Name',
    description:
      'Name for the new world save folder. Use a unique name to avoid overwriting or confusion.',
    required: true,
    default: '',
    placeholder: 'my-new-world',
    masked: false,
  }),
  levelSeed: Value.text({
    name: 'World Seed (Optional)',
    description:
      'Seed used when generating this new world. Leave blank for random.',
    required: false,
    default: null,
    placeholder: 'Leave blank for random',
    masked: false,
  }),
})

const toSingle = (
  name: string,
  value: string,
  description: string | null = null,
) => ({
  name,
  description,
  type: 'single' as const,
  value,
  copyable: false,
  qr: false,
  masked: false,
})

export const createWorld = sdk.Action.withInput(
  'create-world',
  async () => ({
    name: 'Create World',
    description:
      'Create a new world by selecting a new world name and optional seed',
    warning:
      'If this world name does not already exist, Minecraft will generate a new world the next time the service starts with this world selected.',
    allowedStatuses: 'any',
    group: 'Worlds',
    visibility: 'enabled',
  }),
  inputSpec,
  async () => undefined,
  async ({ effects, input }) => {
    const config = normalizeStoreConfig(await storeJson.read().once())
    if (!config) {
      return {
        version: '1',
        title: 'Error',
        message: 'Configuration not found.',
        result: null,
      }
    }

    const worldName = input.worldName.trim()
    const worldSeed = input.levelSeed?.trim() ?? ''

    if (!isValidWorldName(worldName)) {
      return {
        version: '1',
        title: 'Invalid World Name',
        message:
          'World name must be 1-128 characters, cannot be "." or "..", and cannot contain slashes.',
        result: null,
      }
    }

    const worldNames = await listWorldNames()
    if (worldNames.includes(worldName)) {
      return {
        version: '1',
        title: 'World Already Exists',
        message:
          'A saved world with this name already exists. Use Select World to switch to it.',
        result: null,
      }
    }

    await storeJson.merge(effects, {
      levelName: worldName,
      levelSeed: worldSeed,
    })

    return {
      version: '1',
      title: 'World Creation Prepared',
      message:
        'New world settings were saved. Start or restart the service to generate and load this world.',
      result: {
        type: 'group',
        value: [
          toSingle('Previous Configured World', config.levelName),
          toSingle('New Configured World', worldName),
          toSingle('World Seed', worldSeed.length > 0 ? worldSeed : 'Random'),
        ],
      },
    }
  },
)
