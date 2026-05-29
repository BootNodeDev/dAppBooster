/**
 * SDK typed error classes for the dAppBooster adapter architecture.
 *
 * Each error extends Error directly, sets `this.name` to its class name,
 * and carries typed contextual properties in addition to a human-readable message.
 */

// ---------------------------------------------------------------------------
// Wallet errors
// ---------------------------------------------------------------------------

/** Thrown when an operation requires a connected wallet but none is connected. */
export class WalletNotConnectedError extends Error {
  constructor(
    message = 'Wallet is not connected. Connect a wallet before performing this action.',
  ) {
    super(message)
    this.name = 'WalletNotConnectedError'
  }
}

/** Thrown when the expected wallet extension is not found in the browser. */
export class WalletNotInstalledError extends Error {
  constructor(message = 'Wallet extension not found. Please install the required wallet.') {
    super(message)
    this.name = 'WalletNotInstalledError'
  }
}

/** Thrown when the user cancels the wallet connection prompt. */
export class WalletConnectionRejectedError extends Error {
  constructor(message = 'Wallet connection was rejected by the user.') {
    super(message)
    this.name = 'WalletConnectionRejectedError'
  }
}

/** Thrown when a chainId is not in the adapter's supported chains list. */
export class ChainNotSupportedError extends Error {
  readonly chainId: string | number

  constructor(chainId: string | number) {
    super(`Chain ${chainId} is not supported by this adapter.`)
    this.name = 'ChainNotSupportedError'
    this.chainId = chainId
  }
}

/** Thrown when the user cancels a signing request. */
export class SigningRejectedError extends Error {
  constructor(message = 'Signing was rejected by the user.') {
    super(message)
    this.name = 'SigningRejectedError'
  }
}

/** Thrown when an optional method is called on an adapter that does not support it. */
export class CapabilityNotSupportedError extends Error {
  readonly capability: string

  constructor(capability: string) {
    super(`Capability "${capability}" is not supported by this adapter.`)
    this.name = 'CapabilityNotSupportedError'
    this.capability = capability
  }
}

// ---------------------------------------------------------------------------
// Transaction errors
// ---------------------------------------------------------------------------

/** Thrown when the signer type does not match what execute() expects. */
export class InvalidSignerError extends Error {
  readonly expected: string

  constructor(expected: string) {
    super(`Invalid signer: expected a "${expected}" signer at the execute() boundary.`)
    this.name = 'InvalidSignerError'
    this.expected = expected
  }
}

/** Thrown when a balance check fails in prepare(). */
export class InsufficientFundsError extends Error {
  constructor(message = 'Insufficient funds to complete this transaction.') {
    super(message)
    this.name = 'InsufficientFundsError'
  }
}

/** Thrown when prepare() returns ready: false and execution cannot proceed. */
export class TransactionNotReadyError extends Error {
  readonly reason: string

  constructor(reason: string) {
    super(`Transaction not ready: ${reason}`)
    this.name = 'TransactionNotReadyError'
    this.reason = reason
  }
}

/** Thrown when execute() is called with unexecuted preSteps and autoPreSteps is false. */
export class PreStepsNotExecutedError extends Error {
  readonly pendingCount: number

  constructor(pendingCount: number) {
    super(
      `Cannot execute: ${pendingCount} pre-step(s) have not been executed. Run all pre-steps first or enable autoPreSteps.`,
    )
    this.name = 'PreStepsNotExecutedError'
    this.pendingCount = pendingCount
  }
}

// ---------------------------------------------------------------------------
// Registry errors
// ---------------------------------------------------------------------------

// internal
type ConflictAxis = 'chainId' | 'caip2Id'

interface ConflictingDescriptor {
  chainId: string | number
  caip2Id: string
  conflictOn?: ConflictAxis
}

/** Thrown when a duplicate chainId or caip2Id is encountered during registry construction. */
export class ChainRegistryConflictError extends Error {
  readonly chainId: string | number
  readonly caip2Id: string
  readonly conflictOn: ConflictAxis

  constructor({ chainId, caip2Id, conflictOn = 'chainId' }: ConflictingDescriptor) {
    const detail =
      conflictOn === 'chainId'
        ? `a descriptor with chainId ${chainId} is already registered`
        : `a descriptor with caip2Id "${caip2Id}" is already registered`
    super(`Chain registry conflict: ${detail}.`)
    this.name = 'ChainRegistryConflictError'
    this.chainId = chainId
    this.caip2Id = caip2Id
    this.conflictOn = conflictOn
  }
}

// ---------------------------------------------------------------------------
// Provider errors
// ---------------------------------------------------------------------------

/** Thrown when no registered adapter supports the requested chain. */
export class AdapterNotFoundError extends Error {
  readonly chainId: string | number

  constructor(chainId: string | number, adapterKind: 'wallet' | 'transaction' = 'transaction') {
    super(`No ${adapterKind} adapter found for chain ${chainId}.`)
    this.name = 'AdapterNotFoundError'
    this.chainId = chainId
  }
}

/**
 * Thrown when useWallet() is called with no chain type option but multiple adapters are available,
 * making it impossible to resolve unambiguously.
 */
export class AmbiguousAdapterError extends Error {
  readonly availableChainTypes: string[]

  constructor(availableChainTypes: string[]) {
    super(
      `Ambiguous adapter: multiple adapters are available (${availableChainTypes.join(', ')}). Specify a chain type in useWallet() options to disambiguate.`,
    )
    this.name = 'AmbiguousAdapterError'
    this.availableChainTypes = [...availableChainTypes]
  }
}

// ---------------------------------------------------------------------------
// Error formatting utilities
// ---------------------------------------------------------------------------

export { formatErrorMessage, sanitizeErrorMessage } from './format'
