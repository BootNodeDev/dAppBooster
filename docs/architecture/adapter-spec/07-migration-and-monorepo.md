# Migration Path, Monorepo Structure, and Chain Tier Analysis

> Part of the [dAppBooster adapter architecture spec](../adapter-architecture-spec.md).
> See also: [Chain Registry](./01-chain-registry.md), [EVM Adapter](./05-evm-adapter.md)

---

## 12. Migration Path

### From current codebase to adapter architecture

The migration is incremental. Old and new code coexist during transition.

**Phase 1: Introduce adapters alongside existing code**

- Add `@dappbooster/core` interfaces and EVM adapter implementations
- `DAppBoosterProvider` wraps the existing provider stack internally (wagmi + ConnectKit stay underneath)
- New hooks (`useWallet`, `useTransaction`) work alongside existing hooks (`useWeb3Status`, `useWalletStatus`)
- No breaking changes — existing components continue to work

**Phase 2: Migrate components to adapter-backed hooks**

Done:

- `TransactionButton` internals switch from direct wagmi calls to `useTransaction()`
- `SignButton` internals switch to `useWallet().signMessage()`
- `WalletStatusVerifier` becomes `WalletGuard` (old component marked `@deprecated`)
- Old hooks (`useWeb3Status`, `useWalletStatus`) marked `@deprecated` with JSDoc pointing to replacements
- `ConnectWalletButton` is adapter-agnostic (uses `useWallet` + `openConnectModal`, no wagmi imports)
- Connectors expose `useConnectModal` hook, resolved per-adapter via bridge components
- Default connect fallbacks in TransactionButton/SignButton/WalletGuard scoped to target chain

Pending (tracked for Phase 2 completion before Phase 3):

- `TransactionNotificationProvider` still active in `__root.tsx` — depends on `useWeb3Status` and wagmi's `readOnlyClient`. Replace with `createNotificationLifecycle` as global lifecycle hooks.
- `onReplace` lifecycle hook declared in interface but not dispatched by `useTransaction` — wire from EVM adapter's replacement detection.
- Active token/runtime code (`useTokens`, `TokenSelect`, `AddERC20TokenButton`) still consumes deprecated `useWeb3Status` — blocked on read-only adapter path (Phase 3).
- Demo pages use `LegacyTransactionButton` — migrate to adapter-based `TransactionButton` after notification provider migration.

**Phase 3: Extract style package**

- Move styled components to `@dappbooster/chakra`
- `@dappbooster/react` contains only hooks and provider
- `@dappbooster/core` contains only interfaces, types, adapters, and utilities
- Remove deprecated hooks
- `ConnectWalletButton` avatar/ENS display — build on `useReadOnly(address)` to fetch ENS name + avatar without wagmi hooks, making it adapter-agnostic
- Demo dialog z-index conflict — RainbowKit modal's close button is unresponsive when opened from inside a Chakra `Dialog` portal due to competing stacking contexts. Fix by adjusting z-index or closing the demo dialog when the connect modal opens

**Phase 4: Multi-chain adapters**

- Community or official SVM, Cosmos, Sui, Aptos adapters
- `pnpm codegen` script replaces `pnpm wagmi-generate`
- Reference use case apps built and published

**Phase 4+ consideration: DataAdapter interface**

Today the architecture has `WalletAdapter` (connection/signing) and `TransactionAdapter` (write operations). Data *reading* is ad-hoc — wagmi hooks for on-chain reads, LI.FI SDK for token prices, subgraph queries for indexed data. Each has its own fetching, caching, and error handling.

A formal `DataAdapter` interface would standardize this:

```typescript
interface DataAdapter<TQuery, TResult> {
  chainType: string
  query(params: TQuery): Promise<TResult>
  subscribe?(params: TQuery, listener: (result: TResult) => void): () => void
}
```

The existing `@bootnodedev/db-subgraph` codegen tool generates typed GraphQL queries from subgraph schemas. A `SubgraphDataAdapter` could wrap these queries behind the interface, adding SDK error types, lifecycle hooks (onQuery, onError for analytics/logging), and provider integration for a future `useData` hook.

This only justifies itself when consumers need to swap data sources for the same query — e.g., "use The Graph on mainnet but a custom indexer on L2." Until there's a second data source to abstract over, the current direct-query pattern works and formalizing it would be premature. Track as a design consideration, not a committed deliverable.

### What stays, what changes, what goes

| Current | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| `useWeb3Status` | Exists + new `useWallet` | Deprecated | Removed |
| `useWalletStatus` | Exists + new `useWallet` | Deprecated | Removed |
| `TransactionButton` | Unchanged | Adapter-backed internally | Moves to `@dappbooster/chakra` |
| `Web3Provider` | Exists + `DAppBoosterProvider` wraps it | `DAppBoosterProvider` replaces it | Removed |
| `TransactionNotificationProvider` | Exists + global lifecycle hooks | Lifecycle hooks replace it | Removed |
| `connectkit.config.tsx` | Unchanged | Becomes `EvmConnectorConfig` | Same |
| `wagmi-generate` script | Unchanged | Unchanged | Becomes `pnpm codegen` |

---

## 13. Monorepo Directory Structure

The monorepo is managed with **pnpm workspaces** (package management), **Turborepo** (build orchestration + caching), and **Changesets** (versioning + changelogs). npm scope: `@dappbooster/*`.

### Directory layout

```
dAppBooster/                            ← monorepo root
├── packages/
│   ├── core/                           ← @dappbooster/core
│   │   ├── package.json
│   │   └── src/
│   │       ├── adapters/               # WalletAdapter, TransactionAdapter interfaces
│   │       │   ├── wallet.ts           # WalletAdapter interface
│   │       │   ├── transaction.ts      # TransactionAdapter interface
│   │       │   └── lifecycle.ts        # TransactionLifecycle, WalletLifecycle
│   │       ├── chain/                  # ChainDescriptor, ChainRegistry, getExplorerUrl
│   │       │   ├── descriptor.ts       # ChainDescriptor, CurrencyInfo, ExplorerConfig, etc.
│   │       │   ├── registry.ts         # createChainRegistry, ChainRegistry interface
│   │       │   └── explorer.ts         # getExplorerUrl utility
│   │       ├── evm/                    # EVM adapter implementations
│   │       │   ├── connectors/         # Subpath exports with optional peer deps
│   │       │   │   ├── connectkit.ts   # connectkitConnector
│   │       │   │   ├── rainbowkit.ts   # rainbowkitConnector
│   │       │   │   └── reown.ts        # reownConnector
│   │       │   ├── wallet.ts           # EvmWalletAdapter (wraps wagmi)
│   │       │   ├── transaction.ts      # EvmTransactionAdapter (wraps viem)
│   │       │   ├── server-wallet.ts    # EvmServerWallet (private key signer)
│   │       │   ├── chains.ts           # fromViemChain factory, default EVM descriptors
│   │       │   └── types.ts            # EvmTransactionPayload, EvmConnectorConfig
│   │       ├── tokens/                 # Token types, token list config, cache utils
│   │       ├── data/                   # Data adapter interfaces
│   │       ├── types/                  # Shared types (ChainsIds, utility types)
│   │       └── utils/                  # String utils, address utils
│   │
│   ├── react/                          ← @dappbooster/react
│   │   ├── package.json                # depends on @dappbooster/core
│   │   └── src/
│   │       ├── provider/               # DAppBoosterProvider, context
│   │       ├── hooks/
│   │       │   ├── useWallet.ts
│   │       │   ├── useTransaction.ts
│   │       │   ├── useMultiWallet.ts
│   │       │   ├── useReadOnly.ts
│   │       │   ├── useChainRegistry.ts
│   │       │   ├── useTokenLists.ts
│   │       │   ├── useTokens.ts
│   │       │   ├── useErc20Balance.ts
│   │       │   └── useTokenSearch.ts
│   │       └── types/
│   │
│   ├── chakra/                         ← @dappbooster/chakra
│   │   ├── package.json                # depends on @dappbooster/react
│   │   └── src/
│   │       ├── components/
│   │       │   ├── TransactionButton.tsx
│   │       │   ├── SignButton.tsx
│   │       │   ├── WalletGuard.tsx
│   │       │   ├── ConnectWalletButton.tsx
│   │       │   ├── SwitchChain.tsx
│   │       │   ├── ExplorerLink.tsx
│   │       │   ├── Hash.tsx
│   │       │   ├── HashInput.tsx
│   │       │   ├── BigNumberInput.tsx
│   │       │   ├── NotificationToaster.tsx
│   │       │   └── tokens/             # TokenSelect, TokenInput, TokenLogo, TokenDropdown
│   │       └── styles/
│   │
│   └── create-dappbooster/             ← CLI scaffolding tool
│       ├── package.json
│       └── src/
│
├── templates/                          ← what create-dappbooster scaffolds
│   ├── evm-defi/                       # Full dApp starter (replaces .install-files)
│   │   ├── src/
│   │   │   ├── components/             # Header, Footer, page components
│   │   │   ├── contracts/              # ABIs, definitions, generated.ts
│   │   │   ├── routes/                 # TanStack Router pages
│   │   │   ├── theme/                  # Chakra provider, color-mode, fonts
│   │   │   ├── env.ts
│   │   │   └── main.tsx
│   │   ├── package.json                # depends on @dappbooster/core + react + chakra
│   │   └── vite.config.ts
│   ├── bridge/
│   ├── portfolio-tracker/
│   ├── agent-script/
│   └── ...
│
├── apps/                               ← living examples / dev playground
│   └── demo/                           # Current demo app (home page, examples)
│       ├── src/
│       │   ├── components/pageComponents/
│       │   ├── routes/
│       │   └── ...
│       └── package.json
│
├── turbo.json                          ← Turborepo task configuration
├── pnpm-workspace.yaml                 ← workspace package paths
├── .changeset/                         ← Changesets configuration
└── package.json                        ← root scripts + devDeps
```

### Package dependency chain

```
@dappbooster/core       ← no framework dependency
    ↓
@dappbooster/react      ← depends on core
    ↓
@dappbooster/chakra     ← depends on react (and transitively core)
```

`apps/demo` and `templates/*` depend on all three. CLI tools and agent scripts depend on `core` only.

### Package cross-references (pnpm workspaces)

```json
// packages/react/package.json
{ "dependencies": { "@dappbooster/core": "workspace:*" } }

// packages/chakra/package.json
{ "dependencies": { "@dappbooster/react": "workspace:*" } }

// apps/demo/package.json
{ "dependencies": {
    "@dappbooster/core": "workspace:*",
    "@dappbooster/react": "workspace:*",
    "@dappbooster/chakra": "workspace:*"
  }
}
```

`workspace:*` resolves to the local package — pnpm symlinks it. Changes to `packages/core/` are immediately visible to react, chakra, and apps. No publish step during development.

### Turborepo task orchestration

```bash
pnpm build                                # Builds core → react → chakra (dependency order, cached)
pnpm test                                 # Tests all packages in parallel
pnpm test --filter=@dappbooster/core      # Tests only core
pnpm dev                                  # Starts apps/demo with HMR watching all packages
pnpm codegen                              # Runs codegen across all configured chain types
```

Turborepo caches build outputs. If `packages/core/` hasn't changed since last build, it skips it. Typical rebuild after changing one package: <2 seconds.

### Where current domain folders land

The domain folder structure from Task 1 was an intermediate step. In the monorepo, contents scatter by package boundary:

| Current domain folder | Package | What moves |
|---|---|---|
| `src/core/config/`, `types/`, `utils/` | `packages/core/` | Chain config, shared types, utilities |
| `src/core/ui/` (ExplorerLink, Hash, BigNumberInput...) | `packages/chakra/` | Styled components |
| `src/core/ui/` (Header, Footer, Modal, buttons, Chakra setup) | `templates/evm-defi/` | App layout, design system |
| `src/wallet/connectors/` | `packages/core/src/evm/connectors/` | Subpath exports |
| `src/wallet/hooks/`, `providers/` | `packages/core/src/evm/` | Internals of EvmWalletAdapter |
| `src/wallet/components/` | `packages/chakra/` | WalletGuard, SwitchChain, ConnectButton |
| `src/transactions/providers/` | **Removed** | Replaced by lifecycle hooks |
| `src/transactions/components/` | `packages/chakra/` | TransactionButton, SignButton |
| `src/tokens/hooks/` | `packages/react/` | Token data hooks |
| `src/tokens/types/`, `config/`, `utils/` | `packages/core/` | Token infrastructure |
| `src/tokens/components/` | `packages/chakra/` | TokenSelect, TokenInput |
| `src/contracts/wagmi/` | `packages/core/src/evm/` | wagmi config + plugins |
| `src/contracts/abis/`, `definitions.ts` | `templates/evm-defi/` | App-specific contracts |
| `src/data/` (adapter infrastructure) | `packages/core/` | Data adapter pattern |
| `src/data/` (queries, generated types) | `templates/evm-defi/` | App-specific data |
| `src/components/pageComponents/`, `src/routes/` | `apps/demo/` | Demo app |

### Subpath exports for EVM connectors

Connector adapters are thin (~20-30 lines) and use optional peer dependencies:

```json
// packages/core/package.json
{
  "exports": {
    ".": "./src/index.ts",
    "./evm": "./src/evm/index.ts",
    "./evm/connectors/connectkit": "./src/evm/connectors/connectkit.ts",
    "./evm/connectors/rainbowkit": "./src/evm/connectors/rainbowkit.ts",
    "./evm/connectors/reown": "./src/evm/connectors/reown.ts"
  },
  "peerDependencies": {
    "connectkit": "^2.0.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "@reown/appkit-adapter-wagmi": "^1.0.0"
  },
  "peerDependenciesMeta": {
    "connectkit": { "optional": true },
    "@rainbow-me/rainbowkit": { "optional": true },
    "@reown/appkit-adapter-wagmi": { "optional": true }
  }
}
```

CLI tools and agent scripts import `@dappbooster/core` — no connector peer dep installed, no connector code bundled.

---

## Appendix A: Chain Tier Analysis

Research across 23+ blockchain ecosystems informed the ChainDescriptor design. Chains are tiered by ecosystem size, dApp demand, and architectural fit.

### Tier 1 — Must support

| Chain type | Chains | ChainDescriptor field exercised |
|---|---|---|
| **EVM** | Ethereum, Arbitrum, Optimism, Polygon, BSC, Avalanche, zkSync, Monad, Berachain | `feeCurrency` (Berachain tri-token) |
| **SVM** | Solana | `caip2Id` (genesis hash as chainId), `explorer.queryParams` (cluster), tx = signature not hash |
| **MoveVM** | Sui, Aptos | Sui: unstable testnet chainId. Aptos: `endpoints` with `rest` protocol, tx = version number |
| **Cosmos** | Cosmos Hub, Osmosis, Injective, dYdX, Sei | `feeCurrency` (multi-denom), `addressConfig.prefix` (bech32 HRP), `endpoints` (3+ protocols), string chainIds |

### Tier 2 — Worth supporting (can come later)

| Chain type | Chains | Key descriptor fields needed |
|---|---|---|
| **StarkNet** (Cairo) | StarkNet | `feeCurrency` (ETH + STRK), `caip2Id` normalizes felt252 chainId |
| **Substrate** | Polkadot, Kusama, parachains | `addressConfig` (SS58 format + prefix byte), genesis hash chainId |
| **NEAR** | NEAR Protocol | `addressConfig` with `format: 'named'` for human-readable accounts, 24 decimals |
| **TON** | TON (Telegram) | Negative `chainId` (-239), `addressConfig` for raw vs user-friendly formats |

### Tier 3 — Excluded from design considerations

| Chain type | Reason for exclusion |
|---|---|
| **Bitcoin/UTXO** | Not a dApp platform. UTXO model is fundamentally different from account-based. No smart contracts in the dAppBooster sense. |
| **Cardano** | eUTXO model, declining dev ecosystem, no standard RPC, multiple address eras |
| **ICP** | Alien model: canisters, reverse gas, custom binary protocol |
| **Radix** | Tiny ecosystem, entity-type addresses |
| **Fuel** | Early stage, UTXO smart contracts |
| **Tezos, Algorand, Mina** | Small/declining ecosystems |
| **XRP, Stellar** | Exchange/payment focused, not dApp focused |
| **Hedera, MultiversX** | Niche ecosystems |

### What we gain by excluding Tier 3

- No UTXO state model complexity (Bitcoin, Cardano, Fuel)
- No reverse-gas model (ICP)
- No entity-type addresses (Radix)
- No 48-char passphrase chainIds (Stellar)
- `chainId: string | number` remains sufficient for all Tier 1-2 chains
- `AddressConfig` covers all Tier 1-2 address formats without special-casing

### Dual-VM chain handling (Sei)

Sei exposes both an EVM interface (chainId 1329) and a Cosmos interface (chainId `pacific-1`) backed by the same validators. From the SDK's perspective, these are two separate chains:

```typescript
// Sei EVM
{ caip2Id: 'eip155:1329', chainType: 'evm', addressConfig: { format: 'hex', patterns: [/^0x[0-9a-fA-F]{40}$/] } }

// Sei Cosmos
{ caip2Id: 'cosmos:pacific-1', chainType: 'cosmos', addressConfig: { format: 'bech32', prefix: 'sei', patterns: [/^sei1[a-z0-9]{38}$/] } }
```

Each gets its own adapter. The shared infrastructure is transparent to the SDK.
