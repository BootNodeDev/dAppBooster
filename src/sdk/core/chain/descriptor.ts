/**
 * TypeScript interface definitions for chain descriptors in the dAppBooster adapter architecture.
 * No runtime code — types only.
 */

/** Denomination and precision info for a chain's currency. */
export interface CurrencyInfo {
  symbol: string
  decimals: number
  name?: string
}

/** Block explorer URL template for a chain. */
export interface ExplorerConfig {
  name?: string
  /** Base URL, e.g. 'https://etherscan.io' */
  url: string
  /** Path template for transactions, e.g. '/tx/{id}' */
  txPath: string
  /** Path template for addresses, e.g. '/address/{id}' */
  addressPath: string
  /** Path template for blocks, e.g. '/block/{id}' */
  blockPath?: string
  /** Extra query params appended to all URLs, e.g. { cluster: 'mainnet-beta' } for Solana */
  queryParams?: Record<string, string>
}

/** RPC / REST / GraphQL endpoint configuration for a chain. */
export interface EndpointConfig {
  url: string
  protocol: 'json-rpc' | 'rest' | 'graphql' | 'grpc' | 'websocket'
  purpose?: 'default' | 'indexer' | 'archive' | 'streaming'
}

/** Address format and validation rules for a chain. */
export interface AddressConfig {
  /** Encoding/format family for addresses on this chain. */
  format: 'hex' | 'base58' | 'bech32' | 'bech32m' | 'ss58' | 'named' | 'other'
  /** Human-readable part for bech32, or SS58 prefix for Substrate, or Cosmos HRP. */
  prefix?: string
  /** One or more regex patterns that a valid address must match. */
  patterns: RegExp[]
  example?: string
}

/**
 * Canonical descriptor for a blockchain network.
 * Chain-type-agnostic: works for EVM, SVM, Cosmos, MoveVM, etc.
 */
export interface ChainDescriptor {
  /** CAIP-2 identifier, e.g. 'eip155:1', 'solana:5eykt4U...', 'cosmos:cosmoshub-4' */
  caip2Id: string
  /** Native chain ID — number for EVM, string for Solana (genesis hash) and Cosmos */
  chainId: string | number
  name: string
  /** VM / execution environment family: 'evm' | 'svm' | 'movevm-sui' | 'movevm-aptos' | 'cosmos' | ... */
  chainType: string
  nativeCurrency: CurrencyInfo
  /** Fee token when it differs from the native currency (e.g. StarkNet, Berachain). */
  feeCurrency?: CurrencyInfo
  explorer?: ExplorerConfig
  endpoints?: EndpointConfig[]
  addressConfig: AddressConfig
  /** URL or data URI for the chain's icon. */
  icon?: string
  testnet?: boolean
}
