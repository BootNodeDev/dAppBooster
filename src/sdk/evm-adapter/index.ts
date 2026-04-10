// Root barrel: viem-only EVM adapter exports.
// No wagmi, no React — suitable for agent scripts, CLI tools, relayers.

export { fromViemChain } from './chains'
export type { ApprovalPreStepParams, PermitPreStepParams } from './pre-steps'
export { createApprovalPreStep, createPermitPreStep } from './pre-steps'
export { evmReadClientFactory } from './read-client'
export type { EvmServerWalletConfig } from './server-wallet'
export { createEvmServerWallet } from './server-wallet'
export type { EvmTransactionConfig } from './transaction'
export { createEvmTransactionAdapter } from './transaction'
export type {
  EvmContractCall,
  EvmRawTransaction,
  EvmTransactionPayload,
} from './types'
