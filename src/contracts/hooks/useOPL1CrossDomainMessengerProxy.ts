/**
 * Builds TransactionParams for a cross-domain message from L1 to Optimism L2.
 *
 * This is a Level 5 escape hatch — pure async function using viem for OP-specific
 * gas estimation and calldata encoding. The result feeds into useTransaction().execute()
 * or <TransactionButton> at Level 1-2.
 *
 * @precondition fromChain is sepolia or mainnet
 * @precondition walletAddress is a valid connected account
 * @postcondition returns TransactionParams targeting L1CrossDomainMessenger.sendMessage
 * @postcondition gas field includes 20% safety buffer over combined L1+L2 estimates
 */

import { type Address, createPublicClient, encodeFunctionData, type Hash } from 'viem'
import type { mainnet } from 'viem/chains'
import { optimism, optimismSepolia, sepolia } from 'viem/chains'

import { transports } from '@/src/core/types'
import type { TransactionParams } from '@/src/sdk/core'
import type { EvmContractCall } from '@/src/sdk/evm-adapter'
import {
  type ContractFunctionArgs,
  type ContractFunctionName,
  type ContractNames,
  getContract,
} from '../definitions'

export interface BuildCrossDomainMessageConfig {
  fromChain: typeof sepolia | typeof mainnet
  l2ContractAddress: Address
  contractName: ContractNames
  functionName: ContractFunctionName<ContractNames>
  args: ContractFunctionArgs<ContractNames, ContractFunctionName<ContractNames>>
  value: bigint
  walletAddress: Address
}

async function estimateL2Gas({
  contractName,
  functionName,
  args,
  value,
  walletAddress,
  chain,
}: {
  args: ContractFunctionArgs<ContractNames, ContractFunctionName<ContractNames>>
  chain: typeof optimismSepolia | typeof optimism
  contractName: ContractNames
  functionName: ContractFunctionName<ContractNames>
  value?: bigint
  walletAddress: Address
}) {
  const contract = getContract(contractName, chain.id)

  const readOnlyClient = createPublicClient({
    transport: transports[chain.id],
    chain,
  })

  const gas = await readOnlyClient.estimateContractGas({
    address: contract.address,
    abi: contract.abi,
    functionName,
    // biome-ignore lint/suspicious/noExplicitAny: viem generic inference limitation
    args: args as any,
    account: walletAddress,
    // biome-ignore lint/suspicious/noExplicitAny: viem generic inference limitation
    value: value as any,
  })

  const message = encodeFunctionData({
    abi: contract.abi,
    functionName,
    args,
  })

  return { message, gas }
}

async function estimateL1Gas({
  chain,
  l2Gas,
  message,
  value,
}: {
  message: Hash
  value?: bigint
  chain: typeof sepolia | typeof mainnet
  l2Gas: bigint
}) {
  const contract = getContract('OPL1CrossDomainMessengerProxy', chain.id)

  const readOnlyClient = createPublicClient({
    transport: transports[chain.id],
    chain,
  })

  return readOnlyClient.estimateContractGas({
    address: contract.address,
    abi: contract.abi,
    functionName: 'sendMessage',
    args: [contract.address, message, Number(l2Gas)],
    value,
  })
}

/**
 * Builds TransactionParams for an L1→L2 cross-domain message via OP stack.
 *
 * Call this on user action (e.g., button click), then pass the result
 * to useTransaction().execute(params) or <TransactionButton params={params}>.
 *
 * @precondition wallet must be connected to fromChain
 * @postcondition returns TransactionParams with EvmContractCall targeting sendMessage
 */
export async function buildCrossDomainMessageParams(
  config: BuildCrossDomainMessageConfig,
): Promise<TransactionParams> {
  const { fromChain, l2ContractAddress, contractName, functionName, args, value, walletAddress } =
    config

  const l2Chain = fromChain === sepolia ? optimismSepolia : optimism

  const { gas: l2Gas, message } = await estimateL2Gas({
    contractName,
    functionName,
    args,
    value,
    walletAddress,
    chain: l2Chain,
  })

  const l1Gas = await estimateL1Gas({
    chain: fromChain,
    message,
    value,
    l2Gas,
  })

  const contract = getContract('OPL1CrossDomainMessengerProxy', fromChain.id)

  const payload: EvmContractCall = {
    contract: {
      address: contract.address,
      abi: [...contract.abi],
      functionName: 'sendMessage',
      args: [l2ContractAddress, message, Number(l2Gas)],
    },
    value,
    gas: ((l1Gas + l2Gas) * 120n) / 100n,
  }

  return {
    chainId: fromChain.id,
    payload,
  }
}
