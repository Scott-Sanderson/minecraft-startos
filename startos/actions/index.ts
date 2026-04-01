import { sdk } from '../sdk'
import { configureServer } from './configureServer'
import { getServerInfo } from './getServerInfo'
import { getLiveServerStats } from './getLiveServerStats'
import { getConnectionInfo } from './getConnectionInfo'
import { getRconCredentials } from './getRconCredentials'
import { getWebAdminCredentials } from './getWebAdminCredentials'
import { setMemoryAllocation } from './setMemoryAllocation'
import { addToWhitelist } from './addToWhitelist'
import { removeFromWhitelist } from './removeFromWhitelist'

export const actions = sdk.Actions.of()
  .addAction(configureServer)
  .addAction(getServerInfo)
  .addAction(getLiveServerStats)
  .addAction(getConnectionInfo)
  .addAction(getRconCredentials)
  .addAction(getWebAdminCredentials)
  .addAction(setMemoryAllocation)
  .addAction(addToWhitelist)
  .addAction(removeFromWhitelist)
