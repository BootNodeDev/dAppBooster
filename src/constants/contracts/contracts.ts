import { type ContractConfig } from '@wagmi/cli'
import { type Abi, erc20Abi } from 'viem'

import { ENSRegistryABI } from '@/src/constants/contracts/abis/ENSRegistry'
import { type ChainsIds, type RequiredChainId } from '@/src/lib/networks.config'

/**
 * List of contracts to be used in the dapp.
 * Typed contract config using the ChainIds and RequiredChainId types.
 * RequiredChainId is the first chain in the chains array configured in networks.config.ts
 * only requiredChainId is required to be present in the address object. You can also add other availables chain IDs.
 *
 * @returns An array of contract configurations.
 */
export const contracts: ContractConfig<ChainsIds, RequiredChainId>[] = [
  {
    abi: erc20Abi,
    name: 'ERC20',
  },
  {
    abi: ENSRegistryABI,
    address: {
      1: '0x314159265dd8dbb310642f98f50c066173c1259b',
      11155111: '0x0667161579ce7e84EF2b7333f9F93375a627799B',
    },
    name: 'EnsRegistry',
  },
]

type Contract = {
  abi: Abi
  address: string
}

/**
 * Retrieves the contract information based on the contract name and chain ID.
 *
 * @param {string} name - The name of the contract.
 * @param {ChainsIds} chainId - The chain ID configured in the dApp. See networks.config.ts.
 * @returns {Contract} An object containing the contract's ABI and address.
 *
 * @throws If contract is not found.
 */
export const getContract = (name: string, chainId: ChainsIds): Contract => {
  const contract = contracts.find((contract) => contract.name === name)

  if (!contract) {
    throw new Error(`Contract ${name} not found`)
  }

  if (!contract.address) {
    throw new Error(`Contract ${name} addresses not defined`)
  }

  if (!contract.address[chainId]) {
    throw new Error(`Contract ${name} address not found for chain ${chainId}`)
  }

  return {
    abi: contract.abi,
    address: contract.address[chainId],
  }
}
