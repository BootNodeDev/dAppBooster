import { type ContractConfig } from '@wagmi/cli'
import { type Abi, Address, erc20Abi, isAddress } from 'viem'

import { ENSRegistryABI } from '@/src/constants/contracts/abis/ENSRegistry'
import { type ChainsIds, type RequiredChainId } from '@/src/lib/networks.config'

/**
 * A collection of contracts to be used in the dapp with their ABI and addresses per chain.
 *
 * @dev The data required to configure this variable is:
 *  - `RequiredChainId` is mandatory in the address object.
 *  - IDs defined `ChainIds` can be added as well if necessary.
 */
export const contracts: Array<ContractConfig<ChainsIds, RequiredChainId>> = [
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
] as const

type Contract = {
  abi: Abi
  address: Address
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

  if (!isAddress(contract.address[chainId])) {
    throw new Error(`Contract ${name} address is not a valid address`)
  }

  return {
    abi: contract.abi,
    address: contract.address[chainId],
  }
}
