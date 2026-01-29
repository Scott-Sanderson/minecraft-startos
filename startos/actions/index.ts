import { sdk } from '../sdk'
import { getServerInfo } from './getServerInfo'
import { getConnectionInfo } from './getConnectionInfo'
import { getRconCredentials } from './getRconCredentials'
import { getWebAdminCredentials } from './getWebAdminCredentials'
import { setMemoryAllocation } from './setMemoryAllocation'
import { addToWhitelist } from './addToWhitelist'
import { removeFromWhitelist } from './removeFromWhitelist'

export const actions = sdk.Actions.of()
  .addAction(getServerInfo)
  .addAction(getConnectionInfo)
  .addAction(getRconCredentials)
  .addAction(getWebAdminCredentials)
  .addAction(setMemoryAllocation)
  .addAction(addToWhitelist)
  .addAction(removeFromWhitelist)
