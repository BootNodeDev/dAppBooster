import { ContractKeys, contracts } from '@/app/_constants/contracts';
import { ContractConfig, defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { erc20Abi } from 'viem'


const parsedContracts = Object.keys(contracts).map((key) => ({
  name: key,
  ...contracts[key as ContractKeys],  
})).filter((c) => c.autoGenerateHooks);

// Global contracts (need to pass the address as param)
// This global is to avoid to auto-generate hooks for each ERC20 contract that we have in the contract config
const globals: ContractConfig<number, undefined>[] = [
  {
    name: 'erc20',
    abi: erc20Abi,
  },
]


export default defineConfig({
  out: 'app/generated/hooks.ts',
  contracts: [...parsedContracts, ...globals],
  plugins: [
    react(),
  ],
})
