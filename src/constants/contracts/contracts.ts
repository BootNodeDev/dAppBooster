import { type Abi, Address, erc20Abi, isAddress } from 'viem'
import { mainnet, polygon, sepolia } from 'viem/chains'

import { ENSRegistryABI } from '@/src/constants/contracts/abis/ENSRegistry'
import { type ChainsIds } from '@/src/lib/networks.config'

type OptionalAddresses = Partial<Record<ChainsIds, Address>>
type ContractConfig<TAbi> = {
  abi: TAbi
  name: string
  address: OptionalAddresses
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
    address: {},
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
] as const satisfies readonly ContractConfig<Abi>[]

/**
 * Retrieves all contracts.
 *
 * @returns {Array<ContractConfig>} An array containing the contracts' ABI and addresses.
 */
export const getContracts = () => contracts

type ContractNames = (typeof contracts)[number]['name']
type ContractOfName<T extends ContractNames> = Extract<(typeof contracts)[number], { name: T }>
type AddressRecord<T extends ContractNames> = ContractOfName<T>['address']
type AbiOfName<T extends ContractNames> = ContractOfName<T>['abi']
type ChainIdOf<T extends ContractNames> = keyof AddressRecord<T>

export const getContract = <
  ContractName extends ContractNames,
  ChainId extends ChainIdOf<ContractName>,
>(
  name: ContractName,
  chainId: ChainId,
) => {
  // Narrow the contract by its name
  const contract = contracts.find(
    (contract): contract is ContractOfName<ContractName> => contract.name === name,
  )

  if (!contract) {
    throw new Error(`Contract ${name} not found`)
  }
  const addressRecord = contract.address as AddressRecord<ContractName>

  return { abi: contract.abi as AbiOfName<ContractName>, address: addressRecord[chainId] }
}

// const { abi, address } = getContract('EnsRegistry', 11155111)
// const { abi: abi2, address: address2 } = getContract('SpecialERC20WithAddress', 137)
// const { abi: abi3, address: address3 } = getContract('ERC20',)
