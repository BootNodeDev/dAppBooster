// Wagmi barrel: browser wallet adapter using @wagmi/core actions.
// Depends on wagmi + viem. No React.

export type { EvmCoreConnectorConfig } from './types'
export type { EvmWalletAdapterResult, EvmWalletConfig } from './wallet'
export { createEvmWalletAdapter } from './wallet'
