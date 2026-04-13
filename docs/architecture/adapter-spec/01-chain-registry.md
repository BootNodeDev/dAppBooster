# Chain Descriptor and Registry

> Part of the [dAppBooster adapter architecture spec](../adapter-architecture-spec.md).
> See also: [Adapters](./02-adapters.md), [Provider and Hooks](./03-provider-and-hooks.md)

---

Chain metadata is a foundational concern — independent of wallets, transactions, or any adapter. Explorer URLs, native currency, chain names, address formats, and RPC endpoints are properties of the chain itself.

The descriptor was designed after analyzing 23+ blockchain ecosystems to ensure no structural refactoring is needed when adding support for new chain types. See [Appendix A: Chain Tier Analysis](./07-migration-and-monorepo.md#appendix-a-chain-tier-analysis).

### ChainDescriptor

```typescript
interface ChainDescriptor {
  // Universal cross-chain identifier (CAIP-2 standard)
  // Examples: 'eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
  //           'cosmos:cosmoshub-4', 'polkadot:91b171bb158e2d38'
  caip2Id: string

  // Native chain identifier (as the chain knows itself)
  // EVM: number (1, 137, 42161). Cosmos: string ('cosmoshub-4').
  // Solana: string (genesis hash). TON: number (-239). StarkNet: string ('SN_MAIN').
  chainId: string | number

  // Human-readable chain name
  name: string

  // VM/ecosystem family
  chainType: string  // 'evm' | 'svm' | 'movevm-sui' | 'movevm-aptos' | 'cosmos' | 'starknet' | 'substrate' | 'near' | 'ton'

  // Primary currency (staking, transfers, display)
  nativeCurrency: CurrencyInfo

  // Gas/fee currency — only when different from nativeCurrency
  // StarkNet: STRK, Berachain: BERA, Cosmos: may differ from staking token
  feeCurrency?: CurrencyInfo

  // Block explorer configuration
  explorer?: ExplorerConfig

  // Network endpoints — typed by protocol
  endpoints?: EndpointConfig[]

  // Address format metadata
  addressConfig: AddressConfig

  // Chain icon (URL or data URI — for SwitchChain selector, chain badges)
  icon?: string

  // Testnet flag
  testnet?: boolean
}

interface CurrencyInfo {
  symbol: string
  decimals: number
  name?: string
}
```

#### ExplorerConfig

```typescript
interface ExplorerConfig {
  name?: string              // 'Etherscan', 'Solscan', 'Mintscan'
  url: string                // 'https://etherscan.io'
  txPath: string             // '/tx/{id}' — generic {id} placeholder, NOT {hash}
  addressPath: string        // '/address/{id}'
  blockPath?: string         // '/block/{id}'
  queryParams?: Record<string, string>  // Solana: { cluster: 'mainnet-beta' }
}
```

The `{id}` placeholder is chain-agnostic — it works for EVM tx hashes, Solana signatures, Sui digests, Aptos version numbers, and any future identifier format. `queryParams` are appended to all explorer URLs for the chain (handles Solana's `?cluster=mainnet-beta` pattern).

#### EndpointConfig

```typescript
interface EndpointConfig {
  url: string
  protocol: 'json-rpc' | 'rest' | 'graphql' | 'grpc' | 'websocket'
  purpose?: 'default' | 'indexer' | 'archive' | 'streaming'
}
```

Typed by protocol because chain ecosystems vary:
- **EVM**: `json-rpc` (default) + `websocket` (streaming)
- **Cosmos**: `json-rpc` (CometBFT) + `grpc` + `rest` (LCD)
- **Aptos**: `rest` (default) + `graphql` (indexer)
- **Sui**: `json-rpc` (default) + `graphql` (indexer)
- **Solana**: `json-rpc` (default) + `websocket` (PubSub)

Adapters pick the endpoint type they need. The `purpose` field disambiguates when multiple endpoints of the same protocol exist.

#### AddressConfig

```typescript
interface AddressConfig {
  // Address encoding format
  format: 'hex' | 'base58' | 'bech32' | 'bech32m' | 'ss58' | 'named' | 'other'
  // Chain-specific prefix (Cosmos HRP: 'cosmos', 'osmo'. Polkadot SS58 prefix. MultiversX: 'erd1')
  prefix?: string
  // Validation patterns (array — some chains support multiple valid address formats)
  patterns: RegExp[]
  // Example address for documentation/testing
  example?: string
}
```

`patterns` is an array because some chains accept multiple address formats (e.g., Sui accepts both `0x` hex and Bech32m in the future). Most chains have one pattern — the array doesn't add DX cost but keeps the door open.

#### Design decisions

- **`caip2Id` is required, `chainId` is also required.** CAIP-2 is for cross-chain lookups and interoperability. `chainId` is the native value the chain uses internally (passed to wallets, RPC calls, etc.). Both are needed.
- **`feeCurrency` is optional, separate from `nativeCurrency`.** Most chains use the same token for both. When they differ (StarkNet: ETH native + STRK for fees, Berachain: tri-token, Cosmos: staking ≠ fee denom), `feeCurrency` captures the gas/fee token.
- **`addressConfig` is required** (not optional). Every chain has an address format. Making it required prevents runtime errors from missing metadata.
- **`testnet` flag** distinguishes test networks without encoding it in the chain name.
- **Dual-VM chains (Sei)** are registered as two separate ChainDescriptors — `{ caip2Id: 'eip155:1329', chainType: 'evm' }` and `{ caip2Id: 'cosmos:pacific-1', chainType: 'cosmos' }`. From the SDK's perspective, these are different chains with different adapters. The shared infrastructure is transparent.
- **No `stateModel`, `parentChain`, or `accountModel` fields.** These are adapter concerns, not descriptor concerns. The ChainDescriptor describes identity and metadata, not execution model.
- **`supportedChains` must be consistent with the adapter's `chainType`.** If a wallet adapter declares `chainType: 'evm'`, every entry in its `supportedChains` must have `chainType: 'evm'`. The provider validates this at initialization.

### Chain registry

The registry is a lookup structure built from `ChainDescriptor` arrays. It resolves chains by `chainId`, `caip2Id`, or `chainType`.

```typescript
interface ChainRegistry {
  getChain(chainId: string | number): ChainDescriptor | null
  getChainByCaip2(caip2Id: string): ChainDescriptor | null
  getChainType(chainId: string | number): string | null
  getChainsByType(chainType: string): ChainDescriptor[]
  getAllChains(): ChainDescriptor[]
}

function createChainRegistry(chains: ChainDescriptor[]): ChainRegistry
```

If two descriptors declare the same `chainId` or the same `caip2Id` (without being structurally identical), `createChainRegistry` throws `ChainRegistryConflictError` at construction time — fail fast, fail loud. The error carries `chainId`, `caip2Id`, and a `conflictOn: 'chainId' | 'caip2Id'` discriminator so consumers can tell which key clashed.

Lookups (`getChain`, `getChainByCaip2`, `getChainType`) are coerced: a descriptor registered with numeric chainId `1` is also findable with the string `'1'` and vice versa. This is intentional for cross-VM lookups where chainIds may arrive from the network or URL as strings.

### Explorer URL utility

Works anywhere — React, Node, CLI. No adapter or provider required.

```typescript
function getExplorerUrl(
  registry: ChainRegistry,
  params:
    | { chainId: string | number; tx: string }
    | { chainId: string | number; address: string }
    | { chainId: string | number; block: string | number }
): string | null
```

The `tx` parameter (not `txHash`) is chain-agnostic — it accepts whatever identifier the chain uses for transactions (hash, signature, digest, version number).

The SDK ships default `ChainDescriptor` sets for EVM chains via a factory function:

```typescript
import { mainnet, optimism, arbitrum } from 'viem/chains'
import { fromViemChain } from '@dappbooster/evm-adapter'

const chains = [mainnet, optimism, arbitrum].map(fromViemChain)
// Each gets caip2Id, chainId, explorer, endpoints, addressConfig auto-populated from viem
```

Other ecosystem descriptors ship with their respective adapter packages (`@dappbooster/solana`, `@dappbooster/cosmos`, etc.).
