import { z, FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const defaultGameMode = 'survival'
export const defaultDifficulty = 'normal'
export const defaultInitialMemory = '1G'
export const defaultMaximumMemory = '2G'
export const defaultWhitelistEnabled = false
export const defaultWebAdminUsername = 'admin'
export const defaultMotd = 'A Minecraft Server on StartOS'
export const defaultMaxPlayers = 20
export const defaultPauseWhenEmptySeconds = 60
export const defaultViewDistance = 10
export const defaultSimulationDistance = 10
export const defaultOnlineMode = true
export const defaultSpawnProtection = 16
export const defaultPvp = true
export const defaultAllowFlight = false
export const defaultHardcore = false
export const defaultLevelName = 'world'
export const defaultLevelSeed = ''

export type WhitelistEntry = {
  name: string
  uuid?: string
}

const whitelistEntrySchema = z.object({
  name: z.string(),
  uuid: z.string().optional().catch(undefined),
})

const memorySchema = z
  .object({
    initial: z.string().catch(defaultInitialMemory),
    maximum: z.string().catch(defaultMaximumMemory),
  })
  .catch({
    initial: defaultInitialMemory,
    maximum: defaultMaximumMemory,
  })

const storeConfigSchema = z.object({
  rconPassword: z.string().optional().catch(undefined),
  gameMode: z
    .enum(['survival', 'creative', 'adventure', 'spectator'])
    .catch(defaultGameMode),
  difficulty: z
    .enum(['peaceful', 'easy', 'normal', 'hard'])
    .catch(defaultDifficulty),
  memory: memorySchema,
  whitelistEnabled: z.boolean().catch(defaultWhitelistEnabled),
  whitelist: z.array(whitelistEntrySchema).catch([]),
  webAdminUsername: z.string().catch(defaultWebAdminUsername),
  webAdminPassword: z.string().optional().catch(undefined),
  motd: z.string().catch(defaultMotd),
  maxPlayers: z.number().int().catch(defaultMaxPlayers),
  pauseWhenEmptySeconds: z.number().int().catch(defaultPauseWhenEmptySeconds),
  viewDistance: z.number().int().min(2).max(32).catch(defaultViewDistance),
  simulationDistance: z
    .number()
    .int()
    .min(2)
    .max(32)
    .catch(defaultSimulationDistance),
  onlineMode: z.boolean().catch(defaultOnlineMode),
  spawnProtection: z.number().int().min(0).catch(defaultSpawnProtection),
  pvp: z.boolean().catch(defaultPvp),
  allowFlight: z.boolean().catch(defaultAllowFlight),
  hardcore: z.boolean().catch(defaultHardcore),
  levelName: z.string().min(1).catch(defaultLevelName),
  levelSeed: z.string().catch(defaultLevelSeed),
})

export type StoreConfig = z.infer<typeof storeConfigSchema>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'start9/store.json' },
  storeConfigSchema,
)

export const normalizeStoreConfig = (
  config: StoreConfig | null,
): StoreConfig | null => config
