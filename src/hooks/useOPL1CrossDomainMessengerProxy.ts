import { useCallback } from 'react'

import { type Address, type Hash, createPublicClient, encodeFunctionData } from 'viem'
import type { mainnet } from 'viem/chains'
import { optimism, optimismSepolia, sepolia } from 'viem/chains'
import { useWriteContract } from 'wagmi'

import {
  type ContractFunctionArgs,
  type ContractFunctionName,
  type ContractNames,
  getContract,
} from '@/src/constants/contracts/contracts'
import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import { transports } from '@/src/lib/networks.config'

async function l2ContractCallInfo({
  contractName,
  functionName,
  args,
  value,
  walletAddress,
  chain,
}: {
  args: ContractFunctionArgs<typeof contractName, typeof functionName>
  chain: typeof optimismSepolia | typeof optimism
  contractName: ContractNames
  functionName: ContractFunctionName<typeof contractName>
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
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    args: args as any, // TODO: TS does not infer correctly the type of valueuseop
    account: walletAddress,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    value: value as any, // TODO: TS does not infer correctly the type of value
  })

  const message = encodeFunctionData({
    abi: contract.abi,
    functionName,
    args,
  })

  return { message, gas }
}

function estimateGasL1CrossDomainMessenger({
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

  const readOnlyClient = createPublicClient({ transport: transports[chain.id], chain })

  return readOnlyClient.estimateContractGas({
    address: contract.address,
    abi: contract.abi,
    functionName: 'sendMessage',
    args: [contract.address, message, Number(l2Gas)],
    value: value,
  })
}

/**
 * Custom hook to send a cross-domain message from L1 (mainnet or sepolia) to Optimism.
 * @param {Object} params - The params object.
 * @param {Chain} params.fromChain - The chain from which the message is sent.
 * @param {Address} params.l2ContractAddress - The L2 contract address.
 * @param {ContractNames} params.contractName - The contract name.
 * @param {ContractFunctionName} params.functionName - The contract function name.
 * @param {ContractFunctionArgs} params.args - The contract function arguments.
 * @param {bigint} params.value - The value to send.
 * @returns {Function} The function to send the cross-domain message.
 *
 * @description https://docs.optimism.io/builders/app-developers/bridging/messaging#for-l1-to-l2-transactions-1
 */
export function useL1CrossDomainMessengerProxy({
  fromChain,
  l2ContractAddress,
  contractName,
  functionName,
  args,
  value,
}: {
  fromChain: typeof sepolia | typeof mainnet
  l2ContractAddress: Address
  contractName: ContractNames
  functionName: ContractFunctionName<typeof contractName>
  args: ContractFunctionArgs<typeof contractName, typeof functionName>
  value: bigint
}) {
  const { address: walletAddress } = useWeb3StatusConnected()
  const contract = getContract('OPL1CrossDomainMessengerProxy', fromChain.id)
  const { writeContractAsync } = useWriteContract()

  return useCallback(async () => {
    const { gas: l2Gas, message } = await l2ContractCallInfo({
      contractName,
      functionName,
      args,
      value,
      walletAddress,
      chain: fromChain == sepolia ? optimismSepolia : optimism,
    })

    const l1Gas = await estimateGasL1CrossDomainMessenger({
      chain: fromChain,
      message,
      value,
      l2Gas,
    })

    return writeContractAsync({
      chainId: fromChain.id,
      abi: contract.abi,
      address: contract.address,
      functionName: 'sendMessage',
      args: [l2ContractAddress, message, Number(l2Gas)],
      value,
      gas: ((l1Gas + l2Gas) * 120n) / 100n,
    })
  }, [
    contractName,
    functionName,
    args,
    value,
    walletAddress,
    fromChain,
    writeContractAsync,
    contract.abi,
    contract.address,
    l2ContractAddress,
  ])
}
