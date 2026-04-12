import { constants } from 'node:fs'
import type { Stats } from 'node:fs'
import { access, readFile, readdir, stat } from 'node:fs/promises'
import { parse as parseNbt, simplify } from 'prismarine-nbt'
import { sdk } from './sdk'

const levelDatFilename = 'level.dat'
const gameModes = {
  0: 'Survival',
  1: 'Creative',
  2: 'Adventure',
  3: 'Spectator',
} as const
const difficulties = {
  0: 'Peaceful',
  1: 'Easy',
  2: 'Normal',
  3: 'Hard',
} as const

const isErrnoException = (error: unknown): error is NodeJS.ErrnoException =>
  typeof error === 'object' && error !== null && 'code' in error

const getWorldPath = (worldName: string): string =>
  sdk.volumes.main.subpath(worldName)
const getLevelDatPath = (worldName: string): string =>
  sdk.volumes.main.subpath(`${worldName}/${levelDatFilename}`)

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null

const asBooleanFlag = (value: unknown): boolean | null => {
  const numberValue = asNumber(value)
  return numberValue === null ? null : numberValue !== 0
}

const asEpochMillis = (value: unknown): number | null => {
  const numberValue = asNumber(value)
  if (numberValue !== null) return numberValue

  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    const high = value[0]
    const low = value[1] >>> 0
    const epochMillis = high * 2 ** 32 + low
    return Number.isFinite(epochMillis) ? epochMillis : null
  }

  return null
}

const asDateFromEpochMillis = (value: unknown): Date | null => {
  const epochMillis = asEpochMillis(value)
  if (epochMillis === null || epochMillis <= 0) return null

  const date = new Date(epochMillis)
  return Number.isNaN(date.getTime()) ? null : date
}

const getCreatedAt = (directoryStats: Stats): Date | null => {
  if (
    Number.isFinite(directoryStats.birthtimeMs) &&
    directoryStats.birthtimeMs > 0
  ) {
    const birthtime = directoryStats.birthtime
    if (!Number.isNaN(birthtime.getTime())) {
      return birthtime
    }
  }

  const ctime = directoryStats.ctime
  return Number.isNaN(ctime.getTime()) ? null : ctime
}

type WorldMetadata = {
  gameMode: string | null
  difficulty: string | null
  hardcore: boolean | null
  cheatsEnabled: boolean | null
  lastPlayedAt: Date | null
  minecraftVersion: string | null
  metadataError: string | null
}

type SimplifiedLevelData = {
  Data?: Record<string, unknown>
}

const readWorldMetadata = async (worldName: string): Promise<WorldMetadata> => {
  try {
    const parsed = await parseNbt(await readFile(getLevelDatPath(worldName)))
    const simplifiedRoot = simplify(parsed.parsed) as SimplifiedLevelData &
      Record<string, unknown>
    const data =
      typeof simplifiedRoot.Data === 'object' && simplifiedRoot.Data !== null
        ? simplifiedRoot.Data
        : simplifiedRoot

    const gameModeId = asNumber(data.GameType)
    const difficultySettings = asRecord(data.difficulty_settings)
    const difficultyId = asNumber(data.Difficulty)
    const difficultyFromSettings = asString(difficultySettings?.difficulty)
    const normalizedDifficulty = difficultyFromSettings
      ? `${difficultyFromSettings.charAt(0).toUpperCase()}${difficultyFromSettings.slice(1)}`
      : null
    const versionObject = asRecord(data.version) ?? asRecord(data.Version)
    const hardcoreFromSettings = asBooleanFlag(difficultySettings?.hardcore)

    return {
      gameMode:
        gameModeId !== null && gameModeId in gameModes
          ? gameModes[gameModeId as keyof typeof gameModes]
          : null,
      difficulty:
        normalizedDifficulty ??
        (difficultyId !== null && difficultyId in difficulties
          ? difficulties[difficultyId as keyof typeof difficulties]
          : null),
      hardcore: hardcoreFromSettings ?? asBooleanFlag(data.hardcore),
      cheatsEnabled: asBooleanFlag(data.allowCommands),
      lastPlayedAt: asDateFromEpochMillis(data.LastPlayed),
      minecraftVersion: versionObject ? asString(versionObject.Name) : null,
      metadataError: null,
    }
  } catch (error) {
    if (isErrnoException(error) && error.code === 'ENOENT') {
      return {
        gameMode: null,
        difficulty: null,
        hardcore: null,
        cheatsEnabled: null,
        lastPlayedAt: null,
        minecraftVersion: null,
        metadataError: 'level.dat not found.',
      }
    }

    if (error instanceof Error) {
      return {
        gameMode: null,
        difficulty: null,
        hardcore: null,
        cheatsEnabled: null,
        lastPlayedAt: null,
        minecraftVersion: null,
        metadataError: `Unable to parse level.dat: ${error.message}`,
      }
    }

    throw error
  }
}

const isWorldDirectory = async (directoryName: string): Promise<boolean> => {
  const levelDatPath = getLevelDatPath(directoryName)

  try {
    await access(levelDatPath, constants.F_OK)
    return true
  } catch (error) {
    if (isErrnoException(error) && error.code === 'ENOENT') {
      return false
    }

    throw error
  }
}

export const listWorldNames = async (): Promise<string[]> => {
  const entries = await readdir(sdk.volumes.main.path, { withFileTypes: true })
  const worldCandidates = entries.filter((entry) => entry.isDirectory())

  const discoveredWorlds = await Promise.all(
    worldCandidates.map(async (entry) =>
      (await isWorldDirectory(entry.name)) ? entry.name : null,
    ),
  )

  return discoveredWorlds
    .filter((worldName): worldName is string => worldName !== null)
    .sort((left, right) => left.localeCompare(right))
}

export type WorldSummary = {
  name: string
  createdAt: Date | null
  modifiedAt: Date | null
  gameMode: string | null
  difficulty: string | null
  hardcore: boolean | null
  cheatsEnabled: boolean | null
  lastPlayedAt: Date | null
  minecraftVersion: string | null
  metadataError: string | null
}

export const listWorldSummaries = async (): Promise<WorldSummary[]> => {
  const worldNames = await listWorldNames()

  const summaries = await Promise.all(
    worldNames.map(async (worldName) => {
      const directoryStats = await stat(getWorldPath(worldName))
      const metadata = await readWorldMetadata(worldName)

      return {
        name: worldName,
        createdAt: getCreatedAt(directoryStats),
        modifiedAt: Number.isNaN(directoryStats.mtime.getTime())
          ? null
          : directoryStats.mtime,
        gameMode: metadata.gameMode,
        difficulty: metadata.difficulty,
        hardcore: metadata.hardcore,
        cheatsEnabled: metadata.cheatsEnabled,
        lastPlayedAt: metadata.lastPlayedAt,
        minecraftVersion: metadata.minecraftVersion,
        metadataError: metadata.metadataError,
      }
    }),
  )

  return summaries.sort((left, right) => left.name.localeCompare(right.name))
}
