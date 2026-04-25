import { sdk } from '../sdk'
import { configureServer } from './configureServer'
import { getServerInfo } from './getServerInfo'
import { getLiveServerStats } from './getLiveServerStats'
import { getWebAdminCredentials } from './getWebAdminCredentials'
import { listWorlds } from './listWorlds'
import { createWorld } from './createWorld'
import { selectWorld } from './selectWorld'
import { deleteWorld } from './deleteWorld'
import { addToWhitelist } from './addToWhitelist'
import { removeFromWhitelist } from './removeFromWhitelist'

export const actions = sdk.Actions.of()
  .addAction(configureServer)
  .addAction(listWorlds)
  .addAction(createWorld)
  .addAction(selectWorld)
  .addAction(deleteWorld)
  .addAction(getWebAdminCredentials)
  .addAction(getServerInfo)
  .addAction(getLiveServerStats)
  .addAction(addToWhitelist)
  .addAction(removeFromWhitelist)
