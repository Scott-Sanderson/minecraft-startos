import { sdk } from '../sdk'
import { normalizeStoreConfig, storeJson } from '../fileModels/store.json'
import { listWorldNames } from '../worlds'

const { InputSpec, Value } = sdk

const noWorldsOption = '__no-worlds__'

const toWorldSelectValues = (worldNames: string[]) =>
  worldNames.reduce<Record<string, string>>((values, worldName) => {
    values[worldName] = worldName
    return values
  }, {})

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

const inputSpec = InputSpec.of({
  worldName: Value.dynamicSelect(async () => {
    const worldNames = await listWorldNames()

    if (worldNames.length === 0) {
      return {
        name: 'World Save',
        description:
          'No existing world save folders were found. Start the server once to create one.',
        warning: null,
        default: noWorldsOption,
        values: {
          [noWorldsOption]: 'No world saves found',
        },
        disabled: 'No world saves found.',
      }
    }

    return {
      name: 'World Save',
      description:
        'Select which existing world save to use as the configured world.',
      warning: null,
      default: worldNames[0],
      values: toWorldSelectValues(worldNames),
      disabled: false,
    }
  }),
})

export const selectWorld = sdk.Action.withInput(
  'select-world',
  async () => ({
    name: 'Select World',
    description: 'Switch the configured world to an existing saved world',
    warning:
      'Switching worlds changes which save folder loads on startup. If the service is running, it will restart to apply this change.',
    allowedStatuses: 'any',
    group: 'Worlds',
    visibility: 'enabled',
  }),
  inputSpec,
  async () => undefined,
  async ({ effects, input }) => {
    if (input.worldName === noWorldsOption) {
      return {
        version: '1',
        title: 'No Saved Worlds Found',
        message:
          'No existing world save folders were found. Start the server once to create one.',
        result: null,
      }
    }

    const config = normalizeStoreConfig(await storeJson.read().once())
    if (!config) {
      return {
        version: '1',
        title: 'Error',
        message: 'Configuration not found.',
        result: null,
      }
    }

    if (config.levelName === input.worldName) {
      return {
        version: '1',
        title: 'World Already Selected',
        message: `"${input.worldName}" is already the configured world.`,
        result: {
          type: 'group',
          value: [toSingle('Configured World Name', config.levelName)],
        },
      }
    }

    const worldNames = await listWorldNames()
    if (!worldNames.includes(input.worldName)) {
      return {
        version: '1',
        title: 'World Not Found',
        message: `World save "${input.worldName}" was not found.`,
        result: null,
      }
    }

    await storeJson.merge(effects, {
      levelName: input.worldName,
    })

    return {
      version: '1',
      title: 'Configured World Updated',
      message:
        'World selection saved. Start or restart the service to load the selected world.',
      result: {
        type: 'group',
        value: [
          toSingle('Previous Configured World', config.levelName),
          toSingle('Current Configured World', input.worldName),
        ],
      },
    }
  },
)
