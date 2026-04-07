# dAppBooster Adapter Architecture

> **Follow-up to:** [Domain Folder Architecture](https://hackmd.io/@feper/ryUoesKj-l)
> **Status:** Design complete, implementation planning next
> **Date:** 2026-04-01

## Where we are

The domain folder reorganization (Task 1) restructured `src/` into 6 domain folders with sub-barrel entry points. That was the foundation. This document describes what we're building on top of it: a chain-agnostic, headless-first adapter architecture that transforms dAppBooster from an EVM starter template into a multi-chain SDK.

### What changed since the domain folder doc

- **Task 2 (#wallet alias)** — absorbed into the adapter architecture. Connector swapping is now runtime config, not a Vite alias.
- **Task 3 (package extraction)** — informed by this architecture. The domain folders map to packages, but the package boundaries and interfaces are now fully designed.
- **Monorepo** — we're going monorepo (Turborepo + pnpm workspaces + Changesets), not polyrepo.
- **npm scope** — `@dappbooster/*` is reserved on npm.

---

## The big picture

dAppBooster becomes three packages:

```
@dappbooster/core     Adapters, interfaces, types, chain registry.
                      Framework-agnostic — works in Node.js, CLI, agents, Vue, anything.

@dappbooster/react    Hooks and provider.
                      React 19+, no styling dependency.

@dappbooster/chakra   Styled components.
                      One of many possible style packages. Thin wrappers (~30 lines each)
                      around the hooks.
```

A Tailwind user imports `core` + `react` and writes their own 30-line components. A CLI tool imports only `core`. An agent script imports only `core`. The hooks do the heavy lifting — components are just UI wrappers.

### Escape hatch progression

Every layer is independently replaceable:

```
Level 1:  <TransactionButton />          ← zero boilerplate (style package)
Level 2:  useTransaction()               ← control the UI (react hooks)
Level 3:  useTransaction().adapter       ← raw adapter access
Level 4:  adapter prop                   ← bypass provider entirely
Level 5:  @dappbooster/core directly     ← no React, no provider, no hooks
```

Agents default to Level 1. Experienced devs go to Level 2. Edge cases go deeper.

---

## Two adapters, one provider

The architecture separates wallet and transaction concerns into two independent adapter interfaces. You can use one without the other.

### WalletAdapter

Owns connection and signing for a chain type.

```typescript
interface WalletAdapter {
  connect()       → WalletConnection { address, chainId }
  disconnect()
  getStatus()     → { connected, address, chainId, connecting }
  signMessage()   → SignatureResult
  signTypedData() → SignatureResult    // EIP-712, permits, Safe approvals
  getSigner()     → chain-native signer (opaque to the SDK)
}
```

### TransactionAdapter

Owns the four-phase transaction lifecycle. **Optional** — auth-only apps skip this entirely.

```typescript
interface TransactionAdapter {
  prepare()  → { ready, reason, estimatedFee, preSteps[] }
  execute()  → TransactionRef { id, chainType, chainId }
  confirm()  → TransactionResult { status, receipt }
}
```

The four phases — **prepare → execute → confirm → report** — are universal across every blockchain. The implementation differs per chain. That's what adapters are for.

### Why two, not one?

- Swap wallet providers without touching transaction logic.
- Customize gas strategies without touching wallet connection.
- Auth-only apps (like wh-portal-earn) register wallet adapters only — no transaction adapter needed.
- Read-only apps (portfolio trackers) skip both.

---

## Lifecycle hooks

Two sets of hooks for cross-cutting concerns (notifications, analytics, logging):

**TransactionLifecycle** — fires during the transaction four-phase cycle:

```
onPrepare → onPreStep → onSubmit → onConfirm
                                  → onError (any phase)
                                  → onReplace (tx speedup/cancel)
```

**WalletLifecycle** — fires during signing:

```
onSign → onSignComplete
       → onSignError
```

### Two scopes

- **Global** (provider config) — every transaction/signing fires these. The notification system lives here.
- **Per-operation** (passed to a hook/component) — fires for one specific transaction.

Both always fire. Global first, then per-operation. Hooks are observers — they never abort the transaction.

### What this replaces

`TransactionNotificationProvider` with its `watchTx`/`watchHash`/`watchSignature` methods becomes a set of global lifecycle hooks. Same behavior, formalized interface, no special provider.

---

## ChainDescriptor

Chain metadata is independent of adapters. Every chain — whether you connect a wallet to it or not — has an identity: name, explorer, endpoints, address format, currency.

```typescript
interface ChainDescriptor {
  caip2Id: string              // Universal ID: 'eip155:1', 'solana:5eykt4U...', 'cosmos:cosmoshub-4'
  chainId: string | number     // Native ID: 1, 'cosmoshub-4', -239 (TON)
  name: string                 // 'Ethereum', 'Solana', 'Osmosis'
  chainType: string            // 'evm', 'svm', 'cosmos', 'movevm-sui', ...
  nativeCurrency: CurrencyInfo // { symbol: 'ETH', decimals: 18 }
  feeCurrency?: CurrencyInfo   // Only if different from native (StarkNet: STRK, Berachain: BERA)
  explorer?: ExplorerConfig    // URLs with generic {id} placeholder (not {hash})
  endpoints?: EndpointConfig[] // Typed by protocol: json-rpc, rest, graphql, grpc, websocket
  addressConfig: AddressConfig // Format, prefix, validation patterns
  testnet?: boolean
}
```

### Why CAIP-2?

`chainId` means different things on different chains — a number on EVM, a genesis hash on Solana, a string on Cosmos, a negative integer on TON. [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md) is the industry standard that normalizes this: `namespace:reference`. The SDK uses `caip2Id` for cross-chain lookups and `chainId` for native chain interactions.

### Why typed endpoints?

Not every chain uses JSON-RPC. Aptos uses REST. Fuel uses GraphQL. Cosmos uses JSON-RPC + gRPC + REST simultaneously. The `EndpointConfig` declares what protocol each URL speaks, so adapters can pick the right one.

### Explorer URLs use `{id}`, not `{hash}`

Solana calls them "signatures." Sui calls them "digests." Aptos uses version numbers. The `{id}` placeholder is chain-agnostic.

### Chain support tiers

We designed the descriptor by researching 23+ blockchain ecosystems:

| Tier | Chains | Status |
|---|---|---|
| **Must support** | EVM, Solana, Sui, Aptos, Cosmos | Descriptor handles all of these |
| **Later** | StarkNet, Polkadot, NEAR, TON | Descriptor handles all of these |
| **Excluded** | Bitcoin, Cardano, ICP, Radix, Fuel, Tezos, Algorand, XRP, Stellar... | UTXO/alien models — not dApp platforms in the dAppBooster sense |

Dual-VM chains like Sei (EVM + Cosmos) register as two separate descriptors. From the SDK's perspective, they're different chains.

---

## DAppBoosterProvider

The single provider that replaces the current `Web3Provider` + `TransactionNotificationProvider` stack.

```tsx
<DAppBoosterProvider config={{
  wallets: {
    evm: createEvmWalletAdapter({ chains: [mainnet, optimism], connector: connectkitConnector }),
  },
  transactions: {
    evm: createEvmTransactionAdapter(),
  },
  lifecycle: notificationLifecycle,
}}>
  <App />
</DAppBoosterProvider>
```

The provider:

1. Builds a chain registry from all adapters' `supportedChains`
2. Validates no chainId conflicts
3. Syncs wallet state to React context
4. Exposes adapter resolution to hooks

### Different app types, same provider

```tsx
// Auth-only app (portal-earn pattern) — no transaction adapter
{ wallets: { evm, svm, sui, aptos }, walletLifecycle: signingNotifications }

// Read-only portfolio tracker — no adapters at all
{ chains: [...evmChains, solanaMainnet, cosmosHub] }

// Multi-chain bridge
{ wallets: { evm, svm }, transactions: { evm, svm }, lifecycle: notificationLifecycle }
```

---

## React hooks

The primary API for React apps. Each hook resolves adapters from provider context.

| Hook | Replaces | Purpose |
|---|---|---|
| `useWallet({ chainId })` | `useWeb3Status` + `useWalletStatus` | Wallet state + actions for a chain |
| `useTransaction({ chainId, params })` | Inline wagmi calls in TransactionButton | Transaction lifecycle |
| `useMultiWallet()` | — (new) | All registered wallets and their states |
| `useReadOnly({ chainId, address })` | — (new) | Public client for arbitrary addresses, no wallet needed |
| `useChainRegistry()` | — (new) | Chain metadata access |

### useWallet example

```typescript
const wallet = useWallet({ chainId: 1 })

wallet.status        // { connected, address, chainId, connecting }
wallet.isReady       // connected && on correct chain
wallet.needsConnect  // not connected
wallet.needsChainSwitch
wallet.connect()
wallet.signMessage({ message: 'Hello' })
wallet.switchChain(10)
wallet.adapter       // escape hatch — raw adapter
```

### useTransaction example

```typescript
const tx = useTransaction({
  chainId: 1,
  params: { chainId: 1, payload: { contract: { address, abi, functionName, args } } },
  lifecycle: { onConfirm: () => invalidateQueries() },
})

tx.phase       // 'idle' | 'prepare' | 'submit' | 'confirm'
tx.execute()   // runs the full cycle: prepare → submit → confirm
tx.result      // TransactionResult after confirmation
tx.explorerUrl // from chain registry
```

---

## Styled components (style packages)

Components live in `@dappbooster/chakra` (or future `@dappbooster/tailwind`, etc.). They're thin wrappers around hooks:

```tsx
// This is roughly what TransactionButton looks like — ~30 lines
function TransactionButton({ chainId, params, lifecycle, label, ...chakraProps }) {
  const wallet = useWallet({ chainId })
  const tx = useTransaction({ chainId, params, lifecycle })

  if (wallet.needsConnect) return <ConnectWalletButton />
  if (wallet.needsChainSwitch) return <SwitchChainButton chainId={chainId} />

  return (
    <Button onClick={tx.execute} loading={tx.phase !== 'idle'} {...chakraProps}>
      {label}
    </Button>
  )
}
```

A Tailwind version is the same logic, different markup. The hook does the work.

| Component | Purpose |
|---|---|
| `TransactionButton` | One-click transaction with wallet gating |
| `SignButton` | Message signing with wallet gating |
| `WalletGuard` | Gate children on wallet requirements (single or multi-chain) |
| `ConnectWalletButton` | Trigger wallet connection |
| `ExplorerLink` | Chain-agnostic explorer links |
| `SwitchChain` | Chain selector dropdown |

---

## EVM adapter (what ships at launch)

The only adapter we ship initially. It wraps the existing wagmi/viem code — no new EVM logic, just formalization behind the interfaces.

| Adapter method | Wraps |
|---|---|
| `connect()` | ConnectKit/RainbowKit modal |
| `getSigner()` | wagmi `WalletClient` |
| `signMessage()` | wagmi `signMessage` |
| `prepare()` | `estimateGas`, balance check, allowance check |
| `execute()` | `sendTransaction` or `writeContract` |
| `confirm()` | `waitForTransactionReceipt` with replacement detection |

### Connectors are subpath exports

ConnectKit, RainbowKit, and Reown are EVM-specific connector adapters. They live in `@dappbooster/core` as subpath exports with optional peer dependencies:

```typescript
import { connectkitConnector } from '@dappbooster/core/evm/connectors'
```

If you use ConnectKit, install `connectkit`. If you use RainbowKit, install `@rainbow-me/rainbowkit`. A CLI tool installs neither.

### Generated hooks still work

`pnpm codegen` (renamed from `pnpm wagmi-generate`) still produces typed hooks for specific contracts. These coexist with the adapter — they're an EVM-specific convenience, not a replacement. Non-React apps get framework-agnostic typed actions from the same codegen.

---

## Beyond the browser

`@dappbooster/core` is framework-agnostic. Same adapters, same lifecycle, different consumers:

### Agent script (Node.js)

```typescript
import { createEvmTransactionAdapter, createEvmServerWallet } from '@dappbooster/core'

const wallet = createEvmServerWallet({ privateKey: process.env.AGENT_PK })
const evm = createEvmTransactionAdapter()

const ref = await evm.execute(params, wallet.getSigner())
const result = await evm.confirm(ref)
```

### CLI tool

```typescript
import { createChainRegistry, getExplorerUrl } from '@dappbooster/core'
const registry = createChainRegistry([...evmChains, solanaMainnet])

for (const chain of registry.getAllChains()) {
  console.log(`${chain.name}: ${getExplorerUrl(registry, { chainId: chain.chainId, address })}`)
}
```

### Relayer (backend service)

Same adapters with server-side signers. Lifecycle hooks plug into monitoring. The SDK handles execute/confirm; the relayer adds nonce management and retry logic.

---

## 14 validated use cases

Every use case below works with the same adapter interfaces:

| # | Use case | What it validates |
|---|---|---|
| 1 | EVM dApp (Aave-like) | Single-chain, generated hooks, TransactionButton |
| 2 | Auth-only (portal-earn) | Wallet adapters only, multi-platform signing |
| 3 | Portfolio tracker (Rotki-like) | Zero adapters, read-only, arbitrary addresses |
| 4 | Cross-chain bridge | Multi-adapter, flow orchestration (consumer-land) |
| 5 | Tailwind-styled dApp | Hooks only, no Chakra, headless pattern |
| 6 | Agent script | Node.js, server signer, no React |
| 7 | CLI tool | Terminal, multi-chain commands |
| 8 | Relayer | Backend, lifecycle hooks for monitoring |
| 9 | Smart wallet (ERC-4337) | UserOperations, bundler, paymaster |
| 10 | Gasless app | Client signs, server submits |
| 11 | Multi-sig (Safe-like) | Multi-party lifecycle, EIP-712 typed data |
| 12 | Token-gated app | Wallet for identity only, no transactions |
| 13 | ZK identity/voting | Proof generation as PreStep |
| 14 | FHE private DeFi | Encrypt/decrypt middleware on adapters |

---

## Monorepo structure

```
dAppBooster/                            ← monorepo root
├── packages/
│   ├── core/                           ← @dappbooster/core
│   │   ├── package.json
│   │   └── src/
│   │       ├── adapters/               # WalletAdapter, TransactionAdapter interfaces
│   │       ├── chain/                  # ChainDescriptor, ChainRegistry, getExplorerUrl
│   │       ├── evm/                    # EVM adapter implementations
│   │       │   ├── connectors/         # connectkit, rainbowkit, reown (subpath exports)
│   │       │   ├── wallet.ts           # EvmWalletAdapter (wraps wagmi internally)
│   │       │   ├── transaction.ts      # EvmTransactionAdapter (wraps viem)
│   │       │   └── server-wallet.ts    # EvmServerWallet (private key signer)
│   │       ├── tokens/                 # Token types, token list config, cache utils
│   │       ├── data/                   # Data adapter interfaces
│   │       ├── types/                  # Shared types
│   │       └── utils/                  # String utils, address utils
│   │
│   ├── react/                          ← @dappbooster/react
│   │   ├── package.json                # depends on @dappbooster/core
│   │   └── src/
│   │       ├── provider/               # DAppBoosterProvider
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
│   │       │   ├── BigNumberInput.tsx
│   │       │   ├── NotificationToaster.tsx
│   │       │   └── tokens/             # TokenSelect, TokenInput, TokenLogo
│   │       └── styles/
│   │
│   └── create-dappbooster/             ← CLI scaffolding tool
│       ├── package.json
│       └── src/
│
├── templates/                          ← what create-dappbooster scaffolds
│   ├── evm-defi/                       # Full dApp starter
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
│   └── demo/                           # Current demo app (home, examples)
│       ├── src/
│       │   ├── components/pageComponents/
│       │   ├── routes/
│       │   └── ...
│       └── package.json                # depends on @dappbooster/core + react + chakra
│
├── turbo.json                          ← Turborepo config
├── pnpm-workspace.yaml                 ← pnpm workspaces
├── .changeset/                         ← Changesets config
└── package.json                        ← root (scripts, devDeps)
```

### How packages reference each other

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

`workspace:*` means "use the local version from this monorepo." pnpm symlinks them — edit a file in `packages/core/` and the react and chakra packages see the change immediately, no publishing step.

### Daily workflow

```bash
pnpm build                                # Turborepo builds core → react → chakra (dependency order, cached)
pnpm test                                 # Tests across all packages in parallel
pnpm test --filter=@dappbooster/core      # Tests only core
pnpm dev                                  # Starts apps/demo with HMR, watching all packages
```

### Where current domain folders land

The current `src/` domain folder structure dissolves — its contents scatter across packages:

| Current location | Package | Notes |
|---|---|---|
| `src/core/config/`, `src/core/types/`, `src/core/utils/` | `packages/core/` | SDK infrastructure |
| `src/core/ui/ExplorerLink`, `Hash`, `BigNumberInput`, etc. | `packages/chakra/` | Styled components |
| `src/core/ui/Header/`, `Footer/`, `Modal/`, buttons, `chakra/` setup | `templates/evm-defi/` | App-level layout & design system |
| `src/wallet/connectors/` | `packages/core/src/evm/connectors/` | Subpath exports |
| `src/wallet/hooks/`, `providers/` | `packages/core/src/evm/` | Internals of EvmWalletAdapter |
| `src/wallet/components/` | `packages/chakra/` | WalletGuard, SwitchChain, ConnectButton |
| `src/transactions/providers/` | **Removed** — becomes lifecycle hooks | No provider, just hook callbacks |
| `src/transactions/components/` | `packages/chakra/` | TransactionButton, SignButton |
| `src/tokens/hooks/` | `packages/react/` | Token data hooks |
| `src/tokens/types/`, `config/`, `utils/` | `packages/core/` | Token infrastructure |
| `src/tokens/components/` | `packages/chakra/` | TokenSelect, TokenInput, etc. |
| `src/contracts/wagmi/` | `packages/core/src/evm/` | wagmi config + plugins |
| `src/contracts/abis/`, `definitions.ts`, `generated.ts` | `templates/evm-defi/` | App-specific contracts |
| `src/data/adapters/` infrastructure | `packages/core/` | Adapter pattern |
| `src/data/adapters/subgraph/queries/`, `gql/` | `templates/evm-defi/` | App-specific queries |
| `src/components/pageComponents/`, `src/routes/` | `apps/demo/` or `templates/` | App-level code |

### Tooling

- **pnpm workspaces** — package management (already using pnpm)
- **Turborepo** — build orchestration with dependency-aware caching
- **Changesets** — versioning + changelogs for multi-package releases

---

## Migration path

The migration is incremental. Old and new code coexist at each phase.

### Phase 1: Introduce adapters alongside existing code

- Add adapter interfaces and EVM implementations
- `DAppBoosterProvider` wraps the existing provider stack internally
- New hooks (`useWallet`, `useTransaction`) work alongside existing ones
- **No breaking changes**

### Phase 2: Migrate internals to adapter-backed hooks

- TransactionButton/SignButton use `useTransaction`/`useWallet` internally
- `WalletStatusVerifier` → `WalletGuard`
- `TransactionNotificationProvider` → global lifecycle hooks
- Old hooks deprecated with `@deprecated` pointing to replacements

### Phase 3: Extract packages

- Styled components move to `@dappbooster/chakra`
- Hooks and provider become `@dappbooster/react`
- Interfaces, adapters, types become `@dappbooster/core`
- Remove deprecated code

### Phase 4: Multi-chain

- Community or official SVM, Cosmos, Sui, Aptos adapters
- `pnpm codegen` dispatches per chain type
- Reference apps published as templates

---

## What stays the same

- wagmi/viem under the hood for EVM
- TanStack Router for file-based routing
- Chakra UI for the default style package
- Biome for linting
- Vitest for testing
- The domain folder structure from Task 1 maps directly to packages

## What changes

| Before | After |
|---|---|
| EVM-only | Chain-agnostic via adapters |
| Hardcoded ConnectKit import | Connector as config: `createEvmWalletAdapter({ connector })` |
| `TransactionNotificationProvider` | Global lifecycle hooks |
| `useWeb3Status` / `useWalletStatus` | `useWallet({ chainId })` |
| Components coupled to Chakra | Headless hooks + optional style packages |
| Starter template | SDK (installable packages) + templates (scaffolding) |
| Single repo | Monorepo with Turborepo + Changesets |
| `pnpm wagmi-generate` | `pnpm codegen` (multi-chain, dual output) |
