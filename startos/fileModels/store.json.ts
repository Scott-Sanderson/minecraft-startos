import { matches, FileHelper } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = matches.object({
  rconPassword: matches.string,
  gameMode: matches.literals('survival', 'creative', 'adventure', 'spectator'),
  difficulty: matches.literals('peaceful', 'easy', 'normal', 'hard'),
  memory: matches.object({
    initial: matches.string,
    maximum: matches.string,
  }),
  whitelistEnabled: matches.boolean,
  whitelist: matches.arrayOf(matches.object({
    name: matches.string,
    uuid: matches.string.optional().onMismatch(undefined),
  })),
  webAdminUsername: matches.string,
  webAdminPassword: matches.string,
  motd: matches.string,
  maxPlayers: matches.number,
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'start9/store.json' },
  shape
)
