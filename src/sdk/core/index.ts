// Root barrel: interfaces, adapter types, error classes, read-client utilities.
// Chain, utils, and lifecycle have their own sub-path imports.
// EVM code lives in @/src/sdk/evm-adapter (future @dappbooster/evm-adapter).

export * from './adapters'
export * from './errors'
export { createReadClient, resolveReadClient } from './read-client'
