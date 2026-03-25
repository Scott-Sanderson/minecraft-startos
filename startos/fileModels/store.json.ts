import { matches, FileHelper } from '@start9labs/start-sdk'
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

export type StoreConfig = {
  rconPassword?: string
  gameMode: 'survival' | 'creative' | 'adventure' | 'spectator'
  difficulty: 'peaceful' | 'easy' | 'normal' | 'hard'
  memory: {
    initial: string
    maximum: string
  }
  whitelistEnabled: boolean
  whitelist: WhitelistEntry[]
  webAdminUsername: string
  webAdminPassword?: string
  motd: string
  maxPlayers: number
}

const shape = matches.object({
  rconPassword: matches.string.optional().onMismatch(undefined),
  gameMode: matches
    .literals('survival', 'creative', 'adventure', 'spectator')
    .onMismatch(defaultGameMode),
  difficulty: matches
    .literals('peaceful', 'easy', 'normal', 'hard')
    .onMismatch(defaultDifficulty),
  memory: matches
    .object({
      initial: matches.string.onMismatch(defaultInitialMemory),
      maximum: matches.string.onMismatch(defaultMaximumMemory),
    })
    .onMismatch({
      initial: defaultInitialMemory,
      maximum: defaultMaximumMemory,
    }),
  whitelistEnabled: matches.boolean.onMismatch(defaultWhitelistEnabled),
  whitelist: matches
    .arrayOf(
      matches.object({
        name: matches.string,
        uuid: matches.string.optional().onMismatch(undefined),
      }),
    )
    .onMismatch([]),
  webAdminUsername: matches
    .string
    .onMismatch(defaultWebAdminUsername),
  webAdminPassword: matches.string.optional().onMismatch(undefined),
  motd: matches.string.onMismatch(defaultMotd),
  maxPlayers: matches.number.onMismatch(defaultMaxPlayers),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'start9/store.json' },
  shape,
)

export const normalizeStoreConfig = (config: Partial<StoreConfig> | null): StoreConfig | null => {
  if (!config) return null

  return {
    rconPassword: config.rconPassword ?? undefined,
    gameMode: config.gameMode ?? defaultGameMode,
    difficulty: config.difficulty ?? defaultDifficulty,
    memory: {
      initial: config.memory?.initial ?? defaultInitialMemory,
      maximum: config.memory?.maximum ?? defaultMaximumMemory,
    },
    whitelistEnabled: config.whitelistEnabled ?? defaultWhitelistEnabled,
    whitelist: config.whitelist ?? [],
    webAdminUsername: config.webAdminUsername ?? defaultWebAdminUsername,
    webAdminPassword: config.webAdminPassword ?? undefined,
    motd: config.motd ?? defaultMotd,
    maxPlayers: config.maxPlayers ?? defaultMaxPlayers,
  }
}
