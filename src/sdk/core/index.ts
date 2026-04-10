// Root barrel: interfaces, adapter types, error classes, read-client utilities.
// Chain, utils, and lifecycle have their own sub-path imports.
// EVM code lives in @/src/sdk/evm-adapter (future @dappbooster/evm-adapter).

// --- Adapter interfaces and types ---
export type {
  ChainSigner,
  ConfirmOptions,
  ConnectOptions,
  DAppBoosterConfig,
  PrepareResult,
  PreStep,
  ReadClientFactory,
  SignatureResult,
  SignMessageInput,
  SignTypedDataInput,
  TransactionAdapter,
  TransactionAdapterMetadata,
  TransactionParams,
  TransactionRef,
  TransactionResult,
  WalletAdapter,
  WalletAdapterBundle,
  WalletAdapterMetadata,
  WalletConnection,
  WalletInfo,
  WalletStatus,
} from './adapters'
// --- Error classes ---
export {
  AdapterNotFoundError,
  AmbiguousAdapterError,
  CapabilityNotSupportedError,
  ChainNotSupportedError,
  ChainRegistryConflictError,
  extractViemErrorMessage,
  formatErrorMessage,
  InsufficientFundsError,
  InvalidSignerError,
  PreStepsNotExecutedError,
  SigningRejectedError,
  sanitizeErrorMessage,
  TransactionNotReadyError,
  WalletConnectionRejectedError,
  WalletNotConnectedError,
  WalletNotInstalledError,
} from './errors'

// --- Read-client utilities ---
export { createReadClient, resolveReadClient } from './read-client'
