import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'

import { getContracts } from '../definitions'
import { reactSuspenseRead } from './plugins/reactSuspenseRead'

// You can extend the config object with additional properties
// https://wagmi.sh/cli/config/options

export default defineConfig({
  out: 'src/contracts/generated.ts',
  plugins: [reactSuspenseRead(), react()],
  contracts: getContracts(),
})
