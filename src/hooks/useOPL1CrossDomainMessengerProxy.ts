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
    // biome-ignore lint/suspicious/noExplicitAny: TS does not infer correctly the type of valueuseop
    args: args as any,
    account: walletAddress,
    // biome-ignore lint/suspicious/noExplicitAny: TS does not infer correctly the type of value
    value: value as any,
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

  const readOnlyClient = createPublicClient({
    transport: transports[chain.id],
    chain,
  })

  return readOnlyClient.estimateContractGas({
    address: contract.address,
    abi: contract.abi,
    functionName: 'sendMessage',
    args: [contract.address, message, Number(l2Gas)],
    value: value,
  })
}

/**
 * Custom hook to send a cross-domain message from L1 (Ethereum Mainnet or Sepolia) to Optimism.
 *
 * Handles the complex process of sending a message from L1 to L2 through Optimism's
 * CrossDomainMessenger contract, including:
 * - Estimating gas on both L1 and L2
 * - Encoding function data for the message
 * - Adding safety buffer to gas estimates (20%)
 * - Executing the cross-chain transaction
 *
 * @param {Object} params - The parameters object
 * @param {Chain} params.fromChain - Source chain (sepolia or mainnet)
 * @param {Address} params.l2ContractAddress - Target contract address on L2
 * @param {ContractNames} params.contractName - Name of the contract from contracts registry
 * @param {ContractFunctionName} params.functionName - Name of function to call on the L2 contract
 * @param {ContractFunctionArgs} params.args - Arguments to pass to the L2 function
 * @param {bigint} params.value - Value in wei to send with the transaction
 *
 * @returns {Function} Async function that executes the cross-domain message when called
 *
 * @example
 * ```tsx
 * const sendToOptimism = useL1CrossDomainMessengerProxy({
 *   fromChain: sepolia,
 *   l2ContractAddress: '0x...',
 *   contractName: 'MyContract',
 *   functionName: 'myFunction',
 *   args: [arg1, arg2],
 *   value: parseEther('0.1')
 * });
 *
 * // Later in your code
 * const handleClick = async () => {
 *   try {
 *     const txHash = await sendToOptimism();
 *     console.log('Transaction sent:', txHash);
 *   } catch (error) {
 *     console.error('Failed to send cross-domain message:', error);
 *   }
 * };
 * ```
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
      chain: fromChain === sepolia ? optimismSepolia : optimism,
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
