import { type Abi, Address, erc20Abi, isAddress } from 'viem'
import { mainnet, polygon, sepolia } from 'viem/chains'

import { ENSRegistryABI } from '@/src/constants/contracts/abis/ENSRegistry'
import { type ChainsIds } from '@/src/lib/networks.config'

type OptionalAddresses = Partial<Record<ChainsIds, Address>>
type ContractConfig<TAbi> = {
  abi: TAbi
  name: string
  address?: OptionalAddresses
}

/**
 * A collection of contracts to be used in the dapp with their ABI and addresses per chain.
 *
 * @dev The data required to configure this variable is:
 *  - `RequiredChainId` is mandatory in the address object.
 *  - IDs defined `ChainIds` can be added as well if necessary.
 */
const contracts = [
  {
    abi: erc20Abi,
    name: 'ERC20',
  },
  {
    abi: erc20Abi,
    name: 'SpecialERC20WithAddress',
    address: {
      [polygon.id]: '0x314159265dd8dbb310642f98f50c066173ceeeee',
    },
  },
  {
    abi: ENSRegistryABI,
    address: {
      [mainnet.id]: '0x314159265dd8dbb310642f98f50c066173c1259b',
      [sepolia.id]: '0x0667161579ce7e84EF2b7333f9F93375a627799B',
    },
    name: 'EnsRegistry',
  },
] as const satisfies ContractConfig<Abi>[]

/**
 * Retrieves all contracts.
 *
 * @returns {Array<ContractConfig>} An array containing the contracts' ABI and addresses.
 */
export const getContracts = () => contracts

type ContractNames = (typeof contracts)[number]['name']

type ContractOfName<T extends ContractNames> = Extract<(typeof contracts)[number], { name: T }>
type AbiOfName<T extends ContractNames> = ContractOfName<T>['abi']

type AddressRecord<T extends ContractNames> =
  ContractOfName<T> extends { address: infer K } ? K : never
type ChainIdOf<T extends ContractNames> = keyof AddressRecord<T>

/**
 * Retrieves the contract information based on the contract name and chain ID.
 *
 * @param {string} name - The name of the contract.
 * @param {ChainsIds} chainId - The chain ID configured in the dApp. See networks.config.ts.
 * @returns {Contract} An object containing the contract's ABI and address.
 *
 * @throws If contract is not found.
 */
export const getContract = <
  ContractName extends ContractNames,
  ChainId extends ChainIdOf<ContractName>,
>(
  name: ContractName,
  chainId: ChainId,
) => {
  const contract = contracts.find(
    (contract): contract is ContractOfName<ContractName> => contract.name === name,
  )

  if (!contract) {
    throw new Error(`Contract ${name} not found`)
  }

  // address key not present
  if (!('address' in contract)) {
    throw new Error(`Contract ${name} address not found}`)
  }

  const address = (contract.address as AddressRecord<ContractName>)[chainId]

  // address undefined
  if (!address) {
    throw new Error(`Contract ${name} address not found for chain ${chainId.toString()}`)
  }

  // not a valid address
  if (!isAddress(address as string)) {
    throw new Error(`Contract ${name} address is not a valid address`)
  }

  return { abi: contract.abi as AbiOfName<ContractName>, address }
}
