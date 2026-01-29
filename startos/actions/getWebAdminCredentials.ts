import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

export const getWebAdminCredentials = sdk.Action.withoutInput(
  'get-web-admin-credentials',
  async () => ({
    name: 'Get Web Admin Credentials',
    description: 'Get login credentials for the RCON Web Admin UI',
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),
  async ({ effects }) => {
    const config = await storeJson.read((s) => s).once()

    if (!config) {
      return {
        version: '1',
        title: 'Error',
        message: 'Configuration not found',
        result: null,
      }
    }

    return {
      version: '1',
      title: 'Web Admin Credentials',
      message: 'Access the Web Admin UI through the "Web Admin" interface in StartOS.',
      result: {
        type: 'group',
        value: [
          { name: 'Username', description: null, type: 'single' as const, value: config.webAdminUsername, copyable: true, qr: false, masked: false },
          { name: 'Password', description: null, type: 'single' as const, value: config.webAdminPassword, copyable: true, qr: false, masked: true },
        ],
      },
    }
  }
)
