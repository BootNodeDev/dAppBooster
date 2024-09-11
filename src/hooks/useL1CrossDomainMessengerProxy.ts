import { useCallback } from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { type Address, createPublicClient, encodeFunctionData, Hash } from 'viem'
import { mainnet, sepolia, optimism, optimismSepolia } from 'viem/chains'
import { useWriteContract } from 'wagmi'

import {
  ContractFunctionArgs,
  ContractNames,
  getContract,
  ContractFunctionName,
} from '@/src/constants/contracts/contracts'
import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import { transports } from '@/src/lib/networks.config'

function useL2ContractCallInfo({
  contractName,
  functionName,
  args,
  value,
  walletAddress,
  chain,
}: {
  contractName: ContractNames
  functionName: ContractFunctionName<typeof contractName>
  args: ContractFunctionArgs<typeof contractName, typeof functionName>
  value?: bigint
  walletAddress: Address
  chain: typeof optimismSepolia | typeof optimism
}) {
  const contract = getContract(contractName, chain.id)

  const readOnlyClient = createPublicClient({
    transport: transports[chain.id],
    chain,
  })

  const { data: gas } = useSuspenseQuery({
    queryKey: [
      'estimateGas',
      chain.id,
      contract.address,
      functionName,
      args,
      walletAddress,
      value?.toString(),
    ],
    queryFn: () => {
      const contract = getContract(contractName, optimismSepolia.id)

      return readOnlyClient.estimateContractGas({
        address: contract.address,
        abi: contract.abi,
        functionName,
        args,
        account: walletAddress,
        value: value as unknown as undefined, // hack as it is not inferring that there are payable functions
      })
    },
  })

  const message = encodeFunctionData({
    abi: contract.abi,
    functionName,
    args,
  })

  return { message, gas }
}

function useEstimateGasL1CrossDomainMessenger({
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
  return useSuspenseQuery({
    queryKey: ['estimateGas-L1CrossDomainMessengerProxy', message, value?.toString(), chain.id],
    queryFn: async () => {
      const contract = getContract('L1CrossDomainMessengerProxy', chain.id)

      const readOnlyClient = createPublicClient({ transport: transports[chain.id], chain })

      return readOnlyClient.estimateContractGas({
        address: contract.address,
        abi: contract.abi,
        functionName: 'sendMessage',
        args: [contract.address, message, Number(l2Gas)],
        value: value,
      })
    },
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
  const contract = getContract('L1CrossDomainMessengerProxy', fromChain.id)
  const { writeContractAsync } = useWriteContract()

  const { gas: l2Gas, message } = useL2ContractCallInfo({
    contractName,
    functionName,
    args,
    value,
    walletAddress,
    chain: fromChain == sepolia ? optimismSepolia : optimism,
  })

  const { data: l1Gas } = useEstimateGasL1CrossDomainMessenger({
    chain: fromChain,
    message,
    value,
    l2Gas,
  })

  return useCallback(
    () =>
      writeContractAsync({
        chainId: fromChain.id,
        abi: contract.abi,
        address: contract.address,
        functionName: 'sendMessage',
        args: [l2ContractAddress, message, Number(l2Gas)],
        value,
        gas: ((l1Gas + l2Gas) * 120n) / 100n,
      }),
    [
      writeContractAsync,
      fromChain.id,
      contract.abi,
      contract.address,
      l2ContractAddress,
      message,
      l2Gas,
      value,
      l1Gas,
    ],
  )
}
