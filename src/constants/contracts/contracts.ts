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

// Get chain IDs for a given contract name
type ChainIdsForContract<T extends ContractNames> = keyof Extract<
  (typeof contracts)[number],
  { name: T }
>['address']

/**
 * Retrieves the contract information based on the contract name.
 *
 * @param {string} name - The name of the contract.
 * @returns {Contract} The contract's ABI.
 *
 * @throws If contract is not found.
 */ export const getContractAbi = <
  ContractName extends ContractNames,
  Contract extends Extract<(typeof contracts)[number], { name: ContractName }>,
>(
  name: ContractName,
): Contract['abi'] => {
  // Narrow the contract by its name
  const contract = contracts.find(
    (contract): contract is Extract<(typeof contracts)[number], { name: ContractName }> =>
      contract.name === name,
  )

  if (!contract) {
    throw new Error(`Contract ${name} not found`)
  }

  return contract.abi as Contract['abi']
}

export const getContractAux = <ContractName extends ContractNames>(
  name: ContractName,
): Extract<(typeof contracts)[number], { name: ContractName }> => {
  // Narrow the contract by its name
  const contract = contracts.find(
    (contract): contract is Extract<(typeof contracts)[number], { name: ContractName }> =>
      contract.name === name,
  )

  if (!contract) {
    throw new Error(`Contract ${name} not found`)
  }

  return contract
}

/**
 * Retrieves the contract address based on the contract name and chain ID.
 *
 * @param {string} name - The name of the contract.
 * @param {ChainsIds} chainId - The chain ID configured in the dApp. See networks.config.ts.
 * @returns {Contract} An object containing the contract's ABI and address.
 *
 * @throws If contract is not found.
 */ export const getContractAddress = <
  ContractName extends ContractNames,
  ChainId extends ChainIdsForContract<ContractName>,
>(
  name: ContractName,
  chainId: ChainId,
) => {
  // Narrow the contract by its name
  const contract = getContractAux<ContractName>(name)

  const addressRecord = contract.address as Record<ChainId, any>
  const address = addressRecord[chainId]

  if (!isAddress(address)) {
    throw new Error(`Contract ${name} address is not a valid address`)
  }

  return address
}

/**
 * Retrieves the contract information based on the contract name and chain ID.
 *
 * @param {string} name - The name of the contract.
 * @param {ChainsIds} chainId - The chain ID configured in the dApp. See networks.config.ts.
 * @returns {Contract} An object containing the contract's ABI and address.
 *
 * @throws If contract is not found.
 */ export const getContract = <
  ContractName extends ContractNames,
  ChainId extends ChainIdsForContract<ContractName>,
>(
  name: ContractName,
  chainId: ChainId,
) => {
  return {
    abi: getContractAbi(name),
    address: getContractAddress(name, chainId),
  }
}

// const { abi, address } = getContract('EnsRegistry', 11155111)
