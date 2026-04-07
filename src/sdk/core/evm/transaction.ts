import {
  type Chain,
  createPublicClient,
  type Hex,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem'

import type {
  ConfirmOptions,
  PrepareResult,
  TransactionAdapter,
  TransactionParams,
  TransactionRef,
  TransactionResult,
} from '../adapters/transaction'
import type { ChainSigner } from '../adapters/wallet'
import { ChainNotSupportedError, InsufficientFundsError, InvalidSignerError } from '../errors'
import { fromViemChain } from './chains'
import type { EvmContractCall, EvmRawTransaction, EvmTransactionPayload } from './types'

/** Configuration for the EVM transaction adapter. */
export interface EvmTransactionConfig {
  chains: Chain[]
  transports: Record<number, Transport>
}

function isEvmContractCall(payload: EvmTransactionPayload): payload is EvmContractCall {
  return 'contract' in payload && payload.contract !== undefined
}

function isWalletClient(signer: unknown): signer is WalletClient {
  return (
    typeof signer === 'object' &&
    signer !== null &&
    'sendTransaction' in signer &&
    typeof (signer as { sendTransaction: unknown }).sendTransaction === 'function'
  )
}

/**
 * Creates an EVM TransactionAdapter backed by viem's PublicClient (reads) and WalletClient (writes).
 *
 * @precondition config.chains entries must have corresponding transports
 * @postcondition returned adapter.chainType === 'evm'
 * @postcondition returned adapter.supportedChains matches config.chains (mapped via fromViemChain)
 * @invariant adapter.chainType never changes after construction
 * @invariant adapter.supportedChains never changes after construction
 */
export function createEvmTransactionAdapter(
  config: EvmTransactionConfig = { chains: [], transports: {} },
): TransactionAdapter<'evm'> {
  const publicClients = new Map<number, PublicClient>(
    config.chains.map((chain) => [
      chain.id,
      createPublicClient({ chain, transport: config.transports[chain.id] }),
    ]),
  )

  const supportedChains = config.chains.map(fromViemChain)

  function getPublicClient(chainId: string | number): PublicClient {
    const numericId = typeof chainId === 'string' ? Number.parseInt(chainId, 10) : chainId
    const client = publicClients.get(numericId)
    if (!client) {
      throw new Error(`Chain ${chainId} is not configured in this adapter.`)
    }
    return client
  }

  return {
    chainType: 'evm',
    supportedChains,
    metadata: {
      chainType: 'evm',
      feeModel: 'eip1559',
      confirmationModel: 'blockConfirmations',
    },

    /**
     * Estimates gas and validates readiness for the given transaction params.
     *
     * @precondition params.chainId is in supportedChains
     * @postcondition if ready === true -> execute() can be called with these params
     * @postcondition if ready === false -> reason explains why (human-readable)
     * @throws {InsufficientFundsError} if balance too low for gas estimation
     */
    async prepare(params: TransactionParams): Promise<PrepareResult> {
      const numericId =
        typeof params.chainId === 'string' ? Number.parseInt(params.chainId, 10) : params.chainId
      const publicClient = publicClients.get(numericId)
      if (!publicClient) {
        return {
          ready: false,
          reason: `Chain ${params.chainId} is not configured in this adapter.`,
        }
      }

      if (params.preSteps) {
        for (const preStep of params.preSteps) {
          const preStepNumericId =
            typeof preStep.params.chainId === 'string'
              ? Number.parseInt(preStep.params.chainId, 10)
              : preStep.params.chainId
          if (!publicClients.has(preStepNumericId)) {
            return {
              ready: false,
              reason: `Pre-step "${preStep.label}" targets unsupported chain ${preStep.params.chainId}.`,
            }
          }
        }
      }

      const payload = params.payload as EvmTransactionPayload

      try {
        const estimatedGas = isEvmContractCall(payload)
          ? await publicClient.estimateContractGas({
              address: payload.contract.address,
              abi: payload.contract.abi,
              functionName: payload.contract.functionName,
              args: payload.contract.args,
              value: payload.value,
            })
          : await publicClient.estimateGas({
              to: (payload as EvmRawTransaction).to,
              data: (payload as EvmRawTransaction).data,
              value: (payload as EvmRawTransaction).value,
            })

        const gasPrice = await publicClient.getGasPrice()
        const estimatedFeeAmount = estimatedGas * gasPrice

        const chainDescriptor = supportedChains.find((c) => c.chainId === numericId)
        const nativeCurrency = chainDescriptor?.nativeCurrency

        return {
          ready: true,
          estimatedFee: {
            amount: estimatedFeeAmount.toString(),
            symbol: nativeCurrency?.symbol ?? 'ETH',
            decimals: nativeCurrency?.decimals ?? 18,
          },
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (message.includes('insufficient funds')) {
          throw new InsufficientFundsError()
        }
        return { ready: false, reason: message }
      }
    },

    /**
     * Submits the transaction to the network via the provided WalletClient signer.
     *
     * @precondition signer is a valid WalletClient for this adapter's chainType
     * @precondition params.chainId is in supportedChains
     * @postcondition returns TransactionRef with a unique id (tx hash)
     * @postcondition the transaction has been submitted to the network (not yet confirmed)
     * @throws {InvalidSignerError} if signer is not a WalletClient
     * @throws {ChainNotSupportedError} if chainId not in supportedChains
     */
    async execute(params: TransactionParams, signer: ChainSigner): Promise<TransactionRef> {
      if (!isWalletClient(signer)) {
        throw new InvalidSignerError('WalletClient')
      }
      const numericId =
        typeof params.chainId === 'string' ? Number.parseInt(params.chainId, 10) : params.chainId
      if (!publicClients.has(numericId)) {
        throw new ChainNotSupportedError(params.chainId)
      }

      const payload = params.payload as EvmTransactionPayload

      const hash = isEvmContractCall(payload)
        ? await signer.writeContract({
            address: payload.contract.address,
            // Cast needed: EvmContractCall.contract.abi is untyped Abi; viem expects a specific generic.
            abi: payload.contract.abi as Parameters<typeof signer.writeContract>[0]['abi'],
            functionName: payload.contract.functionName as Parameters<
              typeof signer.writeContract
            >[0]['functionName'],
            args: payload.contract.args as Parameters<typeof signer.writeContract>[0]['args'],
            value: payload.value,
            gas: payload.gas,
            maxFeePerGas: payload.maxFeePerGas,
            maxPriorityFeePerGas: payload.maxPriorityFeePerGas,
          } as Parameters<typeof signer.writeContract>[0])
        : await signer.sendTransaction({
            to: (payload as EvmRawTransaction).to,
            data: (payload as EvmRawTransaction).data,
            value: (payload as EvmRawTransaction).value,
            gas: (payload as EvmRawTransaction).gas,
            maxFeePerGas: (payload as EvmRawTransaction).maxFeePerGas,
            maxPriorityFeePerGas: (payload as EvmRawTransaction).maxPriorityFeePerGas,
          } as Parameters<typeof signer.sendTransaction>[0])

      return { chainType: 'evm', id: hash as string, chainId: params.chainId }
    },

    /**
     * Waits for the transaction to be confirmed or times out.
     *
     * @precondition ref was returned by a previous execute() call on this adapter
     * @postcondition result.status is 'success', 'reverted', or 'timeout'
     * @postcondition if 'success' -> result.receipt contains a viem TransactionReceipt
     * @throws never (timeout returns TransactionResult with status: 'timeout')
     */
    async confirm(ref: TransactionRef, options?: ConfirmOptions): Promise<TransactionResult> {
      const publicClient = getPublicClient(ref.chainId)
      const hash = ref.id as Hex
      const timeout = options?.timeout ?? 60_000
      const confirmations = options?.confirmations ?? 1

      let replaced: TransactionResult | undefined

      const receiptPromise = publicClient
        .waitForTransactionReceipt({
          hash,
          confirmations,
          onReplaced(replacement) {
            replaced = {
              status: replacement.reason === 'cancelled' ? 'reverted' : 'success',
              ref: {
                chainType: 'evm',
                id: replacement.transaction.hash,
                chainId: ref.chainId,
              },
              receipt: replacement.transactionReceipt,
            }
          },
        })
        .then((receipt): TransactionResult => {
          if (replaced) {
            return replaced
          }
          return {
            status: receipt.status === 'success' ? 'success' : 'reverted',
            ref,
            receipt,
          }
        })

      const timeoutResult: TransactionResult = { status: 'timeout', ref, receipt: null }
      const timeoutPromise = new Promise<TransactionResult>((resolve) =>
        setTimeout(() => resolve(timeoutResult), timeout),
      )

      return Promise.race([receiptPromise, timeoutPromise])
    },
  }
}
