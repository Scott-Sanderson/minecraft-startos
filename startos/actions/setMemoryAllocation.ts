import { sdk } from '../sdk'
import {
  defaultInitialMemory,
  defaultMaximumMemory,
  normalizeStoreConfig,
  storeJson,
} from '../fileModels/store.json'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  initial: Value.text({
    name: 'Initial Memory',
    description: 'Initial heap size (e.g., "1G", "512M")',
    required: true,
    default: defaultInitialMemory,
    placeholder: defaultInitialMemory,
    masked: false,
  }),
  maximum: Value.text({
    name: 'Maximum Memory',
    description: 'Maximum heap size (e.g., "2G", "4G")',
    required: true,
    default: defaultMaximumMemory,
    placeholder: defaultMaximumMemory,
    masked: false,
  }),
})

export const setMemoryAllocation = sdk.Action.withInput(
  'set-memory-allocation',
  async () => ({
    name: 'Set Memory Allocation',
    description: 'Configure initial and maximum memory for the Minecraft server (requires restart)',
    warning: 'The server will restart to apply these changes.',
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const config = normalizeStoreConfig(await storeJson.read().once())
    return config ? {
      initial: config.memory.initial,
      maximum: config.memory.maximum,
    } : undefined
  },
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

    await storeJson.merge(effects, {
      memory: {
        initial: input.initial,
        maximum: input.maximum,
      },
    })

    return {
      version: '1',
      title: 'Memory Allocation Updated',
      message: 'The server will restart to apply these changes.',
      result: {
        type: 'group',
        value: [
          { name: 'Initial Memory', description: null, type: 'single' as const, value: input.initial, copyable: false, qr: false, masked: false },
          { name: 'Maximum Memory', description: null, type: 'single' as const, value: input.maximum, copyable: false, qr: false, masked: false },
        ],
      },
    }
  }
)
