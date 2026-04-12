import { sdk } from '../sdk'
import {
  defaultDifficulty,
  defaultGameMode,
  defaultInitialMemory,
  defaultAllowFlight,
  defaultHardcore,
  defaultMaximumMemory,
  defaultMaxPlayers,
  defaultMotd,
  defaultOnlineMode,
  defaultPauseWhenEmptySeconds,
  defaultPvp,
  defaultSimulationDistance,
  defaultSpawnProtection,
  defaultViewDistance,
  defaultWhitelistEnabled,
  storeJson,
  normalizeStoreConfig,
} from '../fileModels/store.json'

const { InputSpec, Value, Variants } = sdk

type MemoryConfig = {
  initial: string
  maximum: string
}

const memoryProfiles = {
  starter: { initial: '1G', maximum: '2G' },
  standard: { initial: '2G', maximum: '4G' },
  high: { initial: '4G', maximum: '6G' },
} as const

type MemoryProfileId = keyof typeof memoryProfiles
type MemoryVariantId = MemoryProfileId | 'custom'

const minimumMemoryGiB = 1
const maximumMemoryGiB = 64
const defaultCustomInitialGiB = 1
const defaultCustomMaximumGiB = 2

const normalizeMemoryString = (value: string) => value.trim().toUpperCase()

const parseMemoryToGiB = (value: string): number | null => {
  const normalized = normalizeMemoryString(value)
  const match = normalized.match(/^(\d+)([MG])$/)
  if (!match) return null

  const amount = Number.parseInt(match[1], 10)
  if (Number.isNaN(amount) || amount <= 0) return null

  if (match[2] === 'G') return amount
  return Math.ceil(amount / 1024)
}

const clampGiB = (value: number): number =>
  Math.min(maximumMemoryGiB, Math.max(minimumMemoryGiB, value))

const memoryFromGiB = (valueGiB: number): string => `${valueGiB}G`

const detectMemoryVariant = (memory: MemoryConfig): MemoryVariantId => {
  const initial = normalizeMemoryString(memory.initial)
  const maximum = normalizeMemoryString(memory.maximum)

  for (const [profileId, profile] of Object.entries(memoryProfiles) as [
    MemoryProfileId,
    MemoryConfig,
  ][]) {
    if (initial === profile.initial && maximum === profile.maximum) {
      return profileId
    }
  }

  return 'custom'
}

const toCustomMemoryPrefill = (memory: MemoryConfig) => ({
  initialGiB: clampGiB(
    parseMemoryToGiB(memory.initial) ?? defaultCustomInitialGiB,
  ),
  maximumGiB: clampGiB(
    parseMemoryToGiB(memory.maximum) ?? defaultCustomMaximumGiB,
  ),
})

const defaultMemoryVariant =
  detectMemoryVariant({
    initial: defaultInitialMemory,
    maximum: defaultMaximumMemory,
  }) === 'custom'
    ? 'starter'
    : detectMemoryVariant({
        initial: defaultInitialMemory,
        maximum: defaultMaximumMemory,
      })

const memoryVariants = Variants.of({
  starter: {
    name: 'Starter (Recommended) — 1G initial / 2G max (best for 1-5 players)',
    spec: InputSpec.of({}),
  },
  standard: {
    name: 'Standard — 2G initial / 4G max (best for 5-10 players)',
    spec: InputSpec.of({}),
  },
  high: {
    name: 'High — 4G initial / 6G max (for heavier worlds or >10 players)',
    spec: InputSpec.of({}),
  },
  custom: {
    name: 'Custom (Advanced)',
    spec: InputSpec.of({
      initialGiB: Value.number({
        name: 'Starting Memory',
        description:
          'Initial Java heap size in GiB. This is where Java starts before growing.',
        required: true,
        default: defaultCustomInitialGiB,
        integer: true,
        min: minimumMemoryGiB,
        max: maximumMemoryGiB,
        step: 1,
        units: 'GiB',
      }),
      maximumGiB: Value.number({
        name: 'Maximum Memory',
        description:
          'Maximum Java heap size in GiB. Keep this at or above Starting Memory.',
        required: true,
        default: defaultCustomMaximumGiB,
        integer: true,
        min: minimumMemoryGiB,
        max: maximumMemoryGiB,
        step: 1,
        units: 'GiB',
      }),
    }),
  },
})

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
  memory: Value.union({
    name: 'Memory Allocation',
    description:
      'Pick a preset profile or choose Custom. Most vanilla servers run well with Starter or Standard.',
    default: defaultMemoryVariant,
    variants: memoryVariants,
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
  viewDistance: Value.number({
    name: 'View Distance',
    description:
      'How many chunks players can see in each direction. Higher values use more CPU and RAM.',
    required: true,
    default: defaultViewDistance,
    integer: true,
    min: 2,
    max: 32,
    step: 1,
    units: 'chunks',
  }),
  simulationDistance: Value.number({
    name: 'Simulation Distance',
    description:
      'How many chunks are actively ticking (redstone, mobs, crop growth). Keep at or below View Distance.',
    required: true,
    default: defaultSimulationDistance,
    integer: true,
    min: 2,
    max: 32,
    step: 1,
    units: 'chunks',
  }),
  onlineMode: Value.toggle({
    name: 'Online Mode',
    description:
      'Require Mojang account authentication for joining players. Strongly recommended for public servers.',
    default: defaultOnlineMode,
  }),
  pvp: Value.toggle({
    name: 'Player-vs-Player (PvP)',
    description: 'Allow players to damage each other.',
    default: defaultPvp,
  }),
  allowFlight: Value.toggle({
    name: 'Allow Flight',
    description:
      'Allow player flight. Useful for modded clients; also prevents accidental kicks from anti-flying checks.',
    default: defaultAllowFlight,
  }),
  hardcore: Value.toggle({
    name: 'Hardcore Mode',
    description:
      'Enable hardcore gameplay rules. Intended for permanent-death style servers.',
    default: defaultHardcore,
  }),
  spawnProtection: Value.number({
    name: 'Spawn Protection Radius',
    description:
      'Radius around world spawn where non-ops cannot build/break. Set to 0 to disable.',
    required: true,
    default: defaultSpawnProtection,
    integer: true,
    min: 0,
    max: 512,
    step: 1,
    units: 'blocks',
  }),
  pauseWhenEmptySeconds: Value.number({
    name: 'Pause When Empty (seconds)',
    description:
      'When no players are online, pause world ticking after this many seconds. Set to 0 or -1 to disable.',
    required: true,
    default: defaultPauseWhenEmptySeconds,
    integer: true,
    min: -1,
    max: 86400,
    step: 1,
    units: 'seconds',
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
      'This will overwrite your current configuration. The server must be restarted for changes to take effect. Use List Worlds, Select World, and Create World in the Worlds action group to manage world saves.',
    allowedStatuses: 'any',
    group: 'Setup',
    visibility: 'enabled',
  }),
  inputSpec,
  async () => {
    const config = normalizeStoreConfig(await storeJson.read().once())
    if (!config) return {}

    const memoryVariant = detectMemoryVariant(config.memory)

    return {
      gameMode: config.gameMode as
        | 'survival'
        | 'creative'
        | 'adventure'
        | 'spectator',
      difficulty: config.difficulty as 'peaceful' | 'easy' | 'normal' | 'hard',
      memory:
        memoryVariant === 'custom'
          ? {
              selection: 'custom' as const,
              value: toCustomMemoryPrefill(config.memory),
            }
          : {
              selection: memoryVariant,
              value: {},
            },
      maxPlayers: config.maxPlayers,
      viewDistance: config.viewDistance,
      simulationDistance: config.simulationDistance,
      onlineMode: config.onlineMode,
      pvp: config.pvp,
      allowFlight: config.allowFlight,
      hardcore: config.hardcore,
      spawnProtection: config.spawnProtection,
      pauseWhenEmptySeconds: config.pauseWhenEmptySeconds,
      motd: config.motd,
      whitelistEnabled: config.whitelistEnabled,
    }
  },
  async ({ effects, input }) => {
    const existingConfig = normalizeStoreConfig(await storeJson.read().once())

    let resolvedMemory: MemoryConfig
    if (input.memory.selection === 'custom') {
      const initialGiB = input.memory.value.initialGiB
      const maximumGiB = input.memory.value.maximumGiB

      if (maximumGiB < initialGiB) {
        return {
          version: '1',
          title: 'Invalid Memory Configuration',
          message:
            'Maximum Memory must be greater than or equal to Starting Memory.',
          result: null,
        }
      }

      resolvedMemory = {
        initial: memoryFromGiB(initialGiB),
        maximum: memoryFromGiB(maximumGiB),
      }
    } else {
      resolvedMemory = memoryProfiles[input.memory.selection]
    }

    await storeJson.merge(effects, {
      gameMode: input.gameMode as
        | 'survival'
        | 'creative'
        | 'adventure'
        | 'spectator',
      difficulty: input.difficulty as 'peaceful' | 'easy' | 'normal' | 'hard',
      memory: resolvedMemory,
      maxPlayers: input.maxPlayers,
      viewDistance: input.viewDistance,
      simulationDistance: input.simulationDistance,
      onlineMode: input.onlineMode,
      pvp: input.pvp,
      allowFlight: input.allowFlight,
      hardcore: input.hardcore,
      spawnProtection: input.spawnProtection,
      pauseWhenEmptySeconds: input.pauseWhenEmptySeconds,
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
