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
})

export type StoreConfig = z.infer<typeof storeConfigSchema>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'start9/store.json' },
  storeConfigSchema,
)

export const normalizeStoreConfig = (
  config: StoreConfig | null,
): StoreConfig | null => config
