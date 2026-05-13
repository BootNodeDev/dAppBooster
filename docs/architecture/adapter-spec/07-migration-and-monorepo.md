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

Done:

- Styled components moved to `src/chakra/` (will become `@dappbooster/chakra`)
- `@dappbooster/react` (under `src/sdk/react/`) contains only hooks, provider, and headless components
- Deprecated hooks removed (`useWeb3Status`, `useWalletStatus`)
- `ConnectWalletButton` is fully adapter-agnostic (headless render-prop API in `@dappbooster/react/components`, Chakra wrapper in `@dappbooster/chakra`)
- Demo dialog z-index conflict resolved

**Phase 4: Pluggable foundation (DONE)**

Done:

- `@dappbooster/core` reorganized into sub-path exports (`/chain`, `/utils`, `/lifecycle`); root barrel is empty
- EVM extracted from `@dappbooster/core` into a sibling package `@dappbooster/evm-adapter` with three layers (root viem-only, `/wagmi`, `/react`, `/react/connectors`)
- Codegen orchestrator: `pnpm codegen` replaces `pnpm wagmi-generate` (alias kept for migration). Plugins discovered via `src/sdk/<adapter>/codegen/index.ts` convention or `dappbooster.codegen` field in installed `@dappbooster/*` packages
- `WalletAdapterBundle.readClientFactory` auto-contributes read clients to the provider — no explicit `readClientFactories` config needed when adapters are registered
- `useReadOnly` accepts `address` and returns `{ client, chain, address, explorerAddressUrl }`
- `WalletGuard` supports multi-chain via `require: WalletRequirement[]`
- `useTransaction` exposes manual `executePreStep(index)` / `executeAllPreSteps()` / standalone `prepare()`
- `wrapAdapter` supports transform hooks (`beforeCall`, `afterCall`) alongside observation hooks
- All public SDK exports carry DbC annotations enforced at runtime where applicable

Pending (future phases):

- Monorepo extraction — actual `packages/` layout with pnpm workspaces, Turborepo, Changesets. Internal sub-folder boundaries already match the target package boundaries, so this is a packaging step, not a code restructuring.
- Multi-chain adapters — `@dappbooster/svm-adapter`, `@dappbooster/cosmos-adapter`, `@dappbooster/sui-adapter`, `@dappbooster/aptos-adapter`. Each follows the same three-layer shape as `@dappbooster/evm-adapter`.
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

| Current | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---|---|---|---|---|
| `useWeb3Status` | Exists + new `useWallet` | Deprecated | Removed | Removed |
| `useWalletStatus` | Exists + new `useWallet` | Deprecated | Removed | Removed |
| `TransactionButton` | Unchanged | Adapter-backed internally | Moves to `@dappbooster/chakra` | Same |
| `Web3Provider` | Exists + `DAppBoosterProvider` wraps it | `DAppBoosterProvider` replaces it | Removed | Removed |
| `TransactionNotificationProvider` | Exists + global lifecycle hooks | Lifecycle hooks replace it | Removed | Removed |
| `connectkit.config.tsx` | Unchanged | Becomes `EvmConnectorConfig` | Same | Now `createConnectkitConnector` factory in `@dappbooster/evm-adapter/react/connectors` |
| `wagmi-generate` script | Unchanged | Unchanged | Same | `pnpm codegen` (alias kept) |
| EVM adapter location | `@dappbooster/core/evm` (planned) | Same | Same | Extracted to `@dappbooster/evm-adapter` (root viem-only, `/wagmi`, `/react`, `/react/connectors` sub-paths) |
| Core barrel | `export *` from sub-modules | Same | Same | Empty root for `react`; explicit named exports for `core`; chain/utils/lifecycle have own sub-paths |

---

## 13. Monorepo Directory Structure

The monorepo is managed with **pnpm workspaces** (package management), **Turborepo** (build orchestration + caching), and **Changesets** (versioning + changelogs). npm scope: `@dappbooster/*`.

### Directory layout

```
dAppBooster/                            ← monorepo root
├── packages/
│   ├── core/                           ← @dappbooster/core (zero runtime deps)
│   │   ├── package.json
│   │   └── src/
│   │       ├── adapters/               # WalletAdapter, TransactionAdapter, ReadClientFactory, WalletAdapterBundle interfaces
│   │       │   ├── wallet.ts
│   │       │   ├── transaction.ts
│   │       │   └── provider.ts
│   │       ├── chain/                  # @dappbooster/core/chain sub-path
│   │       │   ├── descriptor.ts       # ChainDescriptor, CurrencyInfo, ExplorerConfig, AddressConfig, EndpointConfig
│   │       │   ├── registry.ts         # createChainRegistry, ChainRegistry interface
│   │       │   └── explorer.ts         # getExplorerUrl utility
│   │       ├── lifecycle/              # @dappbooster/core/lifecycle sub-path
│   │       │   └── lifecycle.ts        # TransactionLifecycle, WalletLifecycle, TransactionPhase
│   │       ├── errors/                 # All typed error classes (root export)
│   │       ├── utils/                  # @dappbooster/core/utils sub-path — wrapAdapter, formatErrorMessage
│   │       └── read-client.ts          # createReadClient, resolveReadClient (root export)
│   │
│   ├── evm-adapter/                    ← @dappbooster/evm-adapter (sibling of core, NOT inside it)
│   │   ├── package.json                # depends on @dappbooster/core (peer); ships viem
│   │   └── src/
│   │       ├── index.ts                # Root barrel: createEvmTransactionAdapter, createEvmServerWallet, fromViemChain, evmReadClientFactory, createApprovalPreStep, createPermitPreStep
│   │       ├── transaction.ts          # createEvmTransactionAdapter (viem)
│   │       ├── server-wallet.ts        # createEvmServerWallet (private key signer)
│   │       ├── chains.ts               # fromViemChain
│   │       ├── pre-steps.ts            # createApprovalPreStep, createPermitPreStep
│   │       ├── read-client.ts          # evmReadClientFactory
│   │       ├── types.ts                # EvmRawTransaction, EvmContractCall, EvmTransactionPayload (viem-only)
│   │       ├── codegen/                # @dappbooster/evm-adapter codegen plugin (referenced by package.json "dappbooster.codegen")
│   │       │   └── index.ts            # Default-exported CodegenPlugin wrapping wagmi-cli
│   │       ├── wagmi/                  # /wagmi sub-path — wagmi + viem, no React
│   │       │   ├── index.ts            # createEvmWalletAdapter, EvmCoreConnectorConfig
│   │       │   ├── wallet.ts
│   │       │   └── types.ts
│   │       └── react/                  # /react sub-path — React + wagmi
│   │           ├── index.ts            # createEvmWalletBundle, useEvmReadOnly, EvmConnectorConfig, ConnectorAppMetadata
│   │           ├── wallet-bundle.tsx
│   │           ├── read-only.ts
│   │           ├── types.ts
│   │           └── connectors/         # /react/connectors sub-path — React connector factories
│   │               ├── connectkit.tsx  # createConnectkitConnector (peer dep: connectkit)
│   │               ├── rainbowkit.tsx  # createRainbowkitConnector (peer dep: @rainbow-me/rainbowkit)
│   │               └── reown.tsx       # createReownConnector (peer dep: @reown/appkit + adapter-wagmi)
│   │
│   ├── react/                          ← @dappbooster/react (depends on core only)
│   │   ├── package.json                # depends on @dappbooster/core (peer)
│   │   └── src/
│   │       ├── index.ts                # Empty (export {}) — sub-paths are canonical
│   │       ├── provider/               # @dappbooster/react/provider — DAppBoosterProvider, useProviderContext
│   │       ├── hooks/                  # @dappbooster/react/hooks — useWallet, useTransaction, useMultiWallet, useReadOnly, useChainRegistry
│   │       ├── components/             # @dappbooster/react/components — headless ConnectWalletButton, WalletGuard
│   │       └── lifecycle/              # @dappbooster/react/lifecycle — createNotificationLifecycle, createSigningNotificationLifecycle
│   │
│   ├── codegen/                        ← @dappbooster/codegen (orchestrator + types)
│   │   ├── package.json                # zero runtime deps
│   │   └── src/
│   │       ├── types.ts                # CodegenPlugin, CodegenResult interfaces
│   │       ├── discover.ts             # discoverLocalPlugins, discoverPackagePlugins, discoverAllPlugins
│   │       ├── run.ts                  # runCodegen orchestrator
│   │       └── index.ts                # Public API barrel
│   │
│   ├── chakra/                         ← @dappbooster/chakra (depends on @dappbooster/react)
│   │   ├── package.json
│   │   └── src/
│   │       ├── ConnectWalletButton.tsx # Chakra wrapper around the headless component
│   │       ├── WalletGuard.tsx         # Chakra wrapper
│   │       ├── TransactionButton.tsx   # Styled, wraps useWallet + useTransaction
│   │       ├── SignButton.tsx          # Styled, wraps useWallet().signMessage
│   │       └── (future) ExplorerLink.tsx, SwitchChain.tsx, NotificationToaster.tsx
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
              @dappbooster/core (zero runtime deps)
                       ↑           ↑
                       │           │
   @dappbooster/evm-adapter    @dappbooster/react
   (viem; wagmi at /wagmi;     (depends on core; no adapter dep)
    React at /react)                ↑
                                    │
                            @dappbooster/chakra
                            (depends on react)

   @dappbooster/codegen (zero deps) — consumed by scripts/codegen.ts and per-adapter codegen plugins
```

Adapters and `@dappbooster/react` are siblings — both depend on `core`, neither depends on the other. `@dappbooster/react`'s provider accepts any adapter that implements core's interfaces; the adapter is supplied at runtime.

`apps/demo` and `templates/*` typically depend on all four (`core`, `evm-adapter`, `react`, `chakra`). Agent scripts depend on `core` + the adapter root they need (e.g., `@dappbooster/evm-adapter`) — no React, no wagmi, no connector code bundled.

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
| `src/wallet/connectors/` | `packages/evm-adapter/src/react/connectors/` | Subpath exports (React-based connectors) |
| `src/wallet/hooks/`, `providers/` | `packages/evm-adapter/src/wagmi/` | Internals of createEvmWalletAdapter |
| `src/wallet/components/` | `packages/chakra/` | WalletGuard, SwitchChain, ConnectButton (Chakra wrappers around headless components in `packages/react/src/components/`) |
| `src/transactions/providers/` | **Removed** | Replaced by lifecycle hooks |
| `src/transactions/components/` | `packages/chakra/` | TransactionButton, SignButton |
| `src/tokens/hooks/` | `packages/react/` | Token data hooks |
| `src/tokens/types/`, `config/`, `utils/` | `packages/core/` | Token infrastructure |
| `src/tokens/components/` | `packages/chakra/` | TokenSelect, TokenInput |
| `src/contracts/wagmi/` | `templates/evm-defi/src/contracts/wagmi/` (consumer-side wagmi config + plugins; the orchestrator that runs them is `@dappbooster/codegen` + `@dappbooster/evm-adapter` codegen plugin) | wagmi config + plugins |
| `src/contracts/abis/`, `definitions.ts` | `templates/evm-defi/` | App-specific contracts |
| `src/data/` (adapter infrastructure) | `packages/core/` | Data adapter pattern |
| `src/data/` (queries, generated types) | `templates/evm-defi/` | App-specific data |
| `src/components/pageComponents/`, `src/routes/` | `apps/demo/` | Demo app |

### Subpath exports for the EVM adapter

`@dappbooster/core` exposes only contract types and chain utilities — it has zero adapter code, zero peer deps, and zero EVM-specific exports:

```json
// packages/core/package.json
{
  "exports": {
    ".": "./src/index.ts",
    "./chain": "./src/chain/index.ts",
    "./utils": "./src/utils/index.ts",
    "./lifecycle": "./src/lifecycle/index.ts"
  }
}
```

The EVM adapter ships its three layers as independently-importable sub-paths, with React and connector libraries declared as **optional peer dependencies**. An agent script that imports the root sub-path installs only viem; a browser dApp that imports `/react` opts into wagmi + React; a connector sub-path opts into one specific connector library.

```json
// packages/evm-adapter/package.json
{
  "name": "@dappbooster/evm-adapter",
  "exports": {
    ".": "./src/index.ts",
    "./wagmi": "./src/wagmi/index.ts",
    "./react": "./src/react/index.ts",
    "./react/connectors/connectkit": "./src/react/connectors/connectkit.tsx",
    "./react/connectors/rainbowkit": "./src/react/connectors/rainbowkit.tsx",
    "./react/connectors/reown": "./src/react/connectors/reown.tsx"
  },
  "dependencies": {
    "viem": "^2.0.0"
  },
  "peerDependencies": {
    "@dappbooster/core": "workspace:*",
    "wagmi": "^2.0.0",
    "react": ">=18",
    "connectkit": "^2.0.0",
    "@rainbow-me/rainbowkit": "^2.0.0",
    "@reown/appkit": "^1.0.0",
    "@reown/appkit-adapter-wagmi": "^1.0.0"
  },
  "peerDependenciesMeta": {
    "wagmi": { "optional": true },
    "react": { "optional": true },
    "connectkit": { "optional": true },
    "@rainbow-me/rainbowkit": { "optional": true },
    "@reown/appkit": { "optional": true },
    "@reown/appkit-adapter-wagmi": { "optional": true }
  },
  "dappbooster": {
    "codegen": "./src/codegen/index.ts"
  }
}
```

CLI tools and agent scripts import `@dappbooster/evm-adapter` — viem only, no wagmi, no React, no connector code bundled. Browser dApps import `/react` (and one connector sub-path) to opt into the full UI integration.

---

## 14. Bundle-Size Targets

The "Pay only for what you import" principle needs measurement to stay honest. `size-limit` runs against every sub-path entry point and fails the build when any entry exceeds its budget.

### How peer deps are counted

The budget for each entry counts **only what dAppBooster adds on top of the consumer's existing dependency set**. viem (a dependency of `@dappbooster/evm-adapter`), wagmi (peer dep of the `/wagmi` sub-path), and react (peer dep of every `/react` sub-path) are marked `ignore` in the size-limit config so they don't double-count.

Concretely: if the EVM adapter root imports a viem function, that function's bytes do not count against the `@dappbooster/evm-adapter` budget — the consumer already has viem installed because they declared it as a peer dep.

### The seven budgeted entries

| Entry | Initial budget (brotli) | What it represents |
|---|---|---|
| `@dappbooster/core` | 3 KB | The contract layer — interfaces, types, error classes |
| `@dappbooster/core/chain` | 1.5 KB | `ChainDescriptor`, `ChainRegistry`, `getExplorerUrl` |
| `@dappbooster/evm-adapter` | 6 KB | viem-only EVM adapter (agent scripts, CLI, relayers) |
| `@dappbooster/evm-adapter/wagmi` | 3 KB | wagmi/core wallet adapter layer |
| `@dappbooster/evm-adapter/react` | 5 KB | Full React bundle (Provider + read-only hook) |
| `@dappbooster/react/hooks` | 6 KB | Headless hooks consumed by every React dApp |
| `@dappbooster/react/components` | 4 KB | Headless `ConnectWalletButton` and `WalletGuard` |

Budgets are set at roughly 2x the captured baseline. Tight enough that accidental bloat surfaces in a single PR; loose enough to absorb normal feature work.

### CI behavior

- **During beta** (`3.0.0-beta.x`, `3.0.0-rc.x`): the GitHub Action runs on every PR and posts the size diff as a comment. Regressions warn but do not fail CI. The contract with consumers is "expect churn."
- **Once stable** (`3.0.0`+): the same Action fails CI when any entry regresses by more than 5% versus the base branch, or exceeds its declared budget.

The CI workflow YAML is wired up when CI infrastructure is set up; this section commits to WHAT is measured, not HOW the Action is configured.

### Capturing a new baseline

When a legitimate change grows a budgeted entry beyond its current limit:

1. Run `pnpm size` locally and confirm the new number.
2. Update the entry's `limit` in `.size-limit.ts` to roughly 2x the new size.
3. Include a one-line note in the PR description explaining why the budget moved.
4. The reviewer confirms the growth is intentional before merging.

### Running locally

```bash
pnpm size           # check every entry against its budget
pnpm size:why       # same, plus per-import contribution breakdown
```

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
