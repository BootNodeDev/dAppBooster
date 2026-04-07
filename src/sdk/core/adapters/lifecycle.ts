/**
 * Lifecycle hook interfaces for wallet and transaction operations.
 * No runtime code — types only.
 */

import type { PrepareResult, PreStep, TransactionRef, TransactionResult } from './transaction'
import type { SignatureResult, SignMessageInput, SignTypedDataInput } from './wallet'

/** Identifies which phase of the transaction flow an error occurred in. */
export type TransactionPhase = 'prepare' | 'preStep' | 'submit' | 'confirm'

/**
 * Optional callbacks injected into the transaction execution flow.
 * All hooks are fire-and-forget — return values are ignored.
 */
export interface TransactionLifecycle {
  onPrepare?: (result: PrepareResult) => void
  onPreStep?: (step: PreStep, index: number) => void
  onPreStepComplete?: (step: PreStep, index: number, result: TransactionResult) => void
  onSubmit?: (ref: TransactionRef) => void
  onConfirm?: (result: TransactionResult) => void
  onError?: (phase: TransactionPhase, error: Error) => void
  /** Called when a transaction is replaced (e.g. speed-up or cancellation). */
  onReplace?: (oldRef: TransactionRef, newRef: TransactionRef, reason: string) => void
}

/**
 * Optional callbacks injected into the wallet signing flow.
 * All hooks are fire-and-forget — return values are ignored.
 */
export interface WalletLifecycle {
  onSign?: (type: 'message' | 'typedData', input: SignMessageInput | SignTypedDataInput) => void
  onSignComplete?: (result: SignatureResult) => void
  onSignError?: (error: Error) => void
}
