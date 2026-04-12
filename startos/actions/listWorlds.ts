import { sdk } from '../sdk'
import { normalizeStoreConfig, storeJson } from '../fileModels/store.json'
import { listWorldSummaries } from '../worlds'

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

const formatDate = (value: Date | null): string =>
  value
    ? value
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d{3}Z$/, ' UTC')
    : 'Unknown'

const formatBoolean = (value: boolean | null): string =>
  value === null ? 'Unknown' : value ? 'Yes' : 'No'

const toWorldDetailRows = (
  world: Awaited<ReturnType<typeof listWorldSummaries>>[number],
  index: number,
  configuredWorld: string,
) => {
  const worldPrefix = `World ${index + 1} (${world.name})`

  return [
    toSingle(
      worldPrefix,
      world.name === configuredWorld ? 'Configured world' : 'Saved world',
    ),
    toSingle(`${worldPrefix} - Created (Filesystem)`, formatDate(world.createdAt)),
    toSingle(`${worldPrefix} - Last Modified`, formatDate(world.modifiedAt)),
    toSingle(`${worldPrefix} - Last Played`, formatDate(world.lastPlayedAt)),
    toSingle(`${worldPrefix} - Game Mode`, world.gameMode ?? 'Unknown'),
    toSingle(`${worldPrefix} - Difficulty`, world.difficulty ?? 'Unknown'),
    toSingle(`${worldPrefix} - Hardcore`, formatBoolean(world.hardcore)),
    toSingle(
      `${worldPrefix} - Cheats Enabled`,
      formatBoolean(world.cheatsEnabled),
    ),
    toSingle(
      `${worldPrefix} - Minecraft Version`,
      world.minecraftVersion ?? 'Unknown',
    ),
    ...(world.metadataError
      ? [toSingle(`${worldPrefix} - Metadata Status`, world.metadataError)]
      : []),
  ]
}

export const listWorlds = sdk.Action.withoutInput(
  'list-worlds',
  async () => ({
    name: 'List Worlds',
    description:
      'List saved worlds with metadata and show which world is currently configured',
    warning: null,
    allowedStatuses: 'any',
    group: 'Worlds',
    visibility: 'enabled',
  }),
  async () => {
    const config = normalizeStoreConfig(await storeJson.read().once())
    const configuredWorld = config?.levelName ?? 'world'
    const worlds = await listWorldSummaries()
    const hasConfiguredWorld = worlds.some(
      (world) => world.name === configuredWorld,
    )

    if (worlds.length === 0) {
      return {
        version: '1',
        title: 'No Saved Worlds Found',
        message:
          'No world save folders were detected yet. Use Create World to stage a new world, then start the service to generate it.',
        result: {
          type: 'group',
          value: [
            toSingle(
              'Configured World',
              configuredWorld,
              'This is the world that will load on next start.',
            ),
          ],
        },
      }
    }

    return {
      version: '1',
      title: 'World List',
      message: hasConfiguredWorld
        ? 'Saved world metadata from persistent storage.'
        : 'Configured World does not match an existing save folder. Starting the server will create a new world with that name.',
      result: {
        type: 'group',
        value: [
          toSingle(
            'Configured World',
            configuredWorld,
            hasConfiguredWorld
              ? 'This world will load when the server starts.'
              : 'No matching folder exists yet.',
          ),
          ...worlds.flatMap((world, index) =>
            toWorldDetailRows(world, index, configuredWorld),
          ),
        ],
      },
    }
  },
)
