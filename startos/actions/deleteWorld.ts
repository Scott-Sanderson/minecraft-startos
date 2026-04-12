import { rm } from 'node:fs/promises'
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

const isErrnoException = (error: unknown): error is NodeJS.ErrnoException =>
  typeof error === 'object' && error !== null && 'code' in error

const inputSpec = InputSpec.of({
  worldName: Value.dynamicSelect(async () => {
    const worldNames = await listWorldNames()

    if (worldNames.length === 0) {
      return {
        name: 'World Save',
        description: 'No world saves are currently available to delete.',
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
      description: 'Select the world save folder to permanently delete.',
      warning: 'Deleting a world is permanent and cannot be undone.',
      default: worldNames[0],
      values: toWorldSelectValues(worldNames),
      disabled: false,
    }
  }),
  confirmation: Value.text({
    name: 'Type DELETE to Confirm',
    description: 'This permanently deletes the selected world save folder.',
    required: true,
    default: '',
    placeholder: 'DELETE',
    masked: false,
  }),
})

export const deleteWorld = sdk.Action.withInput(
  'delete-world',
  async () => ({
    name: 'Delete World',
    description:
      'Permanently delete an unused world save folder (service must be stopped)',
    warning:
      'This action permanently deletes world data and cannot be undone. Back up first if needed.',
    allowedStatuses: 'only-stopped',
    group: 'Worlds',
    visibility: 'enabled',
  }),
  inputSpec,
  async () => undefined,
  async ({ input }) => {
    if (input.worldName === noWorldsOption) {
      return {
        version: '1',
        title: 'No Saved Worlds Found',
        message: 'No world save folders were found to delete.',
        result: null,
      }
    }

    if (input.confirmation.trim() !== 'DELETE') {
      return {
        version: '1',
        title: 'Confirmation Required',
        message: 'Type DELETE exactly to confirm world deletion.',
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

    if (input.worldName === config.levelName) {
      return {
        version: '1',
        title: 'Cannot Delete Configured World',
        message:
          'Use Select World to switch to a different world before deleting this one.',
        result: null,
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

    try {
      await rm(sdk.volumes.main.subpath(input.worldName), {
        recursive: true,
        force: false,
      })
    } catch (error) {
      if (isErrnoException(error) && error.code === 'ENOENT') {
        return {
          version: '1',
          title: 'World Not Found',
          message: `World save "${input.worldName}" was not found.`,
          result: null,
        }
      }

      throw error
    }

    return {
      version: '1',
      title: 'World Deleted',
      message: `World save "${input.worldName}" was deleted permanently.`,
      result: {
        type: 'group',
        value: [
          {
            name: 'Deleted World',
            description: null,
            type: 'single' as const,
            value: input.worldName,
            copyable: true,
            qr: false,
            masked: false,
          },
          {
            name: 'Remaining Saved Worlds',
            description: null,
            type: 'single' as const,
            value: Math.max(worldNames.length - 1, 0).toString(),
            copyable: false,
            qr: false,
            masked: false,
          },
        ],
      },
    }
  },
)
