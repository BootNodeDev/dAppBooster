/**
 * TransactionAdapter interface and supporting types for the dAppBooster adapter architecture.
 * No runtime code — types only.
 */

import type { ChainDescriptor } from '../chain'
import type { ChainSigner } from './wallet'

/** A preliminary transaction that must be executed before the main one (e.g. token approval). */
export interface PreStep {
  label: string
  params: TransactionParams
}

/** Chain-agnostic description of a transaction to be prepared or executed. */
export interface TransactionParams {
  chainId: string | number
  /** Chain-specific transaction payload (e.g. viem TransactionRequest for EVM). */
  payload: unknown
  /** Steps that must succeed before this transaction can be submitted. */
  preSteps?: PreStep[]
}

/** Result of prepare() — indicates whether the transaction is ready to execute. */
export interface PrepareResult {
  ready: boolean
  /** Human-readable reason when ready is false. */
  reason?: string
  estimatedFee?: {
    amount: string
    symbol: string
    decimals: number
  }
}

/** Chain-agnostic reference to an in-flight or completed transaction. */
export interface TransactionRef {
  chainType: string
  /** Transaction hash or equivalent chain-specific identifier. */
  id: string
  chainId: string | number
}

/** Options for confirm() polling/timeout behaviour. */
export interface ConfirmOptions {
  /** Number of block confirmations to wait for. */
  confirmations?: number
  /** Maximum wait time in milliseconds before resolving with status 'timeout'. */
  timeout?: number
}

/** Final outcome returned by confirm(). */
export interface TransactionResult {
  status: 'success' | 'reverted' | 'timeout'
  ref: TransactionRef
  /** Chain-specific receipt (e.g. viem TransactionReceipt for EVM). */
  receipt: unknown
}

/** Static metadata exposed by a TransactionAdapter implementation. */
export interface TransactionAdapterMetadata {
  chainType: string
  /** Description of the fee model used (e.g. 'eip1559', 'priorityFee', 'gasless'). */
  feeModel: string
  /** Description of the confirmation model used (e.g. 'blockConfirmations', 'finality'). */
  confirmationModel: string
}

/**
 * Adapter interface for submitting and confirming on-chain transactions.
 * Works with the ChainSigner produced by the matching WalletAdapter.
 * TChainType narrows the chainType discriminant for registry lookups.
 */
export interface TransactionAdapter<TChainType extends string = string> {
  readonly chainType: TChainType
  readonly supportedChains: ChainDescriptor[]
  readonly metadata: TransactionAdapterMetadata

  /** Validates and estimates a transaction before execution. Signer is optional — used for accurate gas estimation. */
  prepare(params: TransactionParams, signer?: ChainSigner): Promise<PrepareResult>
  /** Submits the transaction using the provided signer. Returns a ref immediately. */
  execute(params: TransactionParams, signer: ChainSigner): Promise<TransactionRef>
  /** Polls until the transaction reaches a terminal state. */
  confirm(ref: TransactionRef, options?: ConfirmOptions): Promise<TransactionResult>
}
