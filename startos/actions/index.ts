import { sdk } from '../sdk'
import { configureServer } from './configureServer'
import { getServerInfo } from './getServerInfo'
import { getLiveServerStats } from './getLiveServerStats'
import { getConnectionInfo } from './getConnectionInfo'
import { getWebAdminCredentials } from './getWebAdminCredentials'
import { addToWhitelist } from './addToWhitelist'
import { removeFromWhitelist } from './removeFromWhitelist'

export const actions = sdk.Actions.of()
  .addAction(configureServer)
  .addAction(getWebAdminCredentials)
  .addAction(getServerInfo)
  .addAction(getLiveServerStats)
  .addAction(getConnectionInfo)
  .addAction(addToWhitelist)
  .addAction(removeFromWhitelist)
