import { sdk } from '../sdk'
import {
  defaultDifficulty,
  defaultGameMode,
  defaultInitialMemory,
  defaultMaximumMemory,
  defaultMaxPlayers,
  defaultMotd,
  defaultWhitelistEnabled,
  storeJson,
  normalizeStoreConfig,
} from '../fileModels/store.json'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  gameMode: Value.select({
    name: 'Game Mode',
    description: 'Select the default game mode for players',
    default: defaultGameMode,
    values: {
      survival: 'Survival',
      creative: 'Creative',
      adventure: 'Adventure',
      spectator: 'Spectator',
    },
  }),
  difficulty: Value.select({
    name: 'Difficulty',
    description: 'Server difficulty level',
    default: defaultDifficulty,
    values: {
      peaceful: 'Peaceful',
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
    },
  }),
  initialMemory: Value.text({
    name: 'Initial Memory',
    description:
      'Initial Java heap size (e.g., 1G, 2G, 512M). Must be a number followed by M or G.',
    required: true,
    default: defaultInitialMemory,
    placeholder: defaultInitialMemory,
    masked: false,
  }),
  maximumMemory: Value.text({
    name: 'Maximum Memory',
    description:
      'Maximum Java heap size (e.g., 2G, 4G). Must be a number followed by M or G.',
    required: true,
    default: defaultMaximumMemory,
    placeholder: defaultMaximumMemory,
    masked: false,
  }),
  maxPlayers: Value.number({
    name: 'Max Players',
    description: 'Maximum number of players that can join',
    required: true,
    default: defaultMaxPlayers,
    integer: true,
    min: 1,
    max: 10000,
  }),
  motd: Value.text({
    name: 'Message of the Day (MOTD)',
    description: 'Server description shown in the server list',
    required: true,
    default: defaultMotd,
    placeholder: defaultMotd,
    masked: false,
  }),
  whitelistEnabled: Value.toggle({
    name: 'Enable Whitelist',
    description: 'Only allow whitelisted players to join',
    default: defaultWhitelistEnabled,
  }),
})

export const configureServer = sdk.Action.withInput(
  'configure-server',
  async () => ({
    name: 'Configure Server',
    description: 'Configure your Minecraft server settings',
    warning:
      'This will overwrite your current configuration. The server must be restarted for changes to take effect.',
    allowedStatuses: 'any',
    group: 'Setup',
    visibility: 'enabled',
  }),
  inputSpec,
  async () => {
    const config = normalizeStoreConfig(await storeJson.read().once())
    if (!config) return {}

    return {
      gameMode: config.gameMode as
        | 'survival'
        | 'creative'
        | 'adventure'
        | 'spectator',
      difficulty: config.difficulty as 'peaceful' | 'easy' | 'normal' | 'hard',
      initialMemory: config.memory.initial,
      maximumMemory: config.memory.maximum,
      maxPlayers: config.maxPlayers,
      motd: config.motd,
      whitelistEnabled: config.whitelistEnabled,
    }
  },
  async ({ effects, input }) => {
    const existingConfig = normalizeStoreConfig(await storeJson.read().once())

    await storeJson.merge(effects, {
      gameMode: input.gameMode as
        | 'survival'
        | 'creative'
        | 'adventure'
        | 'spectator',
      difficulty: input.difficulty as 'peaceful' | 'easy' | 'normal' | 'hard',
      memory: {
        initial: input.initialMemory,
        maximum: input.maximumMemory,
      },
      maxPlayers: input.maxPlayers,
      motd: input.motd,
      whitelistEnabled: input.whitelistEnabled,
      whitelist: existingConfig?.whitelist ?? [],
    })

    return {
      version: '1',
      title: 'Configuration Saved',
      message:
        'Your Minecraft server has been configured successfully. Start the service to apply changes.',
      result: null,
    }
  },
)
