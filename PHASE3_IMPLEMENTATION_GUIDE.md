# Phase 3 Implementation Guide

> **Status:** Working document — not versioned, local reference only
> **Source:** Code review of `feat/adapter-architecture-phase-2` (April 6-7, 2026)
> **Purpose:** File-level cleanup steps and architectural decisions for Phase 3 execution

---

## Domain Folder Cleanup

### src/wallet/

**Problem:** Contains Chakra-styled presentation components alongside wallet logic, violating the spec's core/react/chakra layering.

| File | Current role | Phase 3 action |
|---|---|---|
| `components/ConnectButton/` | Chakra-styled button (theme tokens, hover states) | Move to `@dappbooster/chakra` or `templates/` |
| `components/SwitchChainButton.tsx` | Thin Chakra `SecondaryButton` wrapper | Move to `@dappbooster/chakra` |
| `components/SwitchNetwork.tsx` | Chakra Menu + Portal + styled items | Move to `@dappbooster/chakra` |
| `components/WalletStatusVerifier.tsx` | Deprecated gating component | Delete — replaced by `WalletGuard` in SDK react |
| `components/WalletStatusVerifier.test.tsx` | Tests for deprecated component | Delete |
| `components.ts` | Barrel exporting above + `useWeb3StatusConnected` | Remove deprecated exports; keep only what moves to chakra |
| `hooks/useWalletStatus.ts` | Deprecated → `useWallet` | Delete |
| `hooks/useWalletStatus.test.ts` | Tests for deprecated hook | Delete |
| `hooks/useWeb3Status.tsx` | Deprecated → `useWallet` + `useChainRegistry` | Delete after token infra migration |
| `hooks.ts` | Barrel for deprecated hooks only | Delete (empty after above) |
| `providers/Web3Provider.tsx` | Legacy wagmi/query/connectkit provider stack | Delete — replaced by `DAppBoosterProvider` |
| `providers.ts` | Re-exports `ConnectWalletButton` from SDK | Keep as public surface or move to SDK barrel |
| `connectors/connectkit.config.tsx` | Old ConnectKit config (module-scope wagmi Config) | Delete — replaced by `src/sdk/core/evm/connectors/connectkit.tsx` |
| `connectors/rainbowkit.config.tsx` | Old RainbowKit config | Delete — replaced by SDK connector |
| `connectors/reown.config.tsx` | Old Reown config | Delete — replaced by SDK connector |
| `connectors/wagmi.config.ts` | Shared wagmi Config (single source of truth) | Keep — this is the correct pattern |
| `connectors/portoInit.ts` | Porto side-effect init | Keep — still needed at app level |
| `types.ts` | Re-exports from deprecated hooks | Delete after hook removal |

**Dependency chain:** `useWeb3Status` removal is blocked by token infra migration (see below).

**SDK layering violation:** `src/sdk/react/components/ConnectWalletButton.tsx` imports `ConnectButton` from `@/src/wallet/components/ConnectButton`. Fix: make SDK `ConnectWalletButton` headless (expose state + callbacks), move styled version to `@dappbooster/chakra`.

### src/transactions/

**Structure:**
```
src/transactions/
├── components.ts          → barrel (TransactionButton, SignButton, LegacyTransactionButton)
├── providers.ts           → barrel (TransactionNotificationProvider, useTransactionNotification)
├── components/
│   ├── TransactionButton.tsx       → adapter-backed (useTransaction + useWallet) — Chakra-styled
│   ├── SignButton.tsx              → adapter-backed (useWallet.signMessage) — Chakra-styled
│   └── LegacyTransactionButton.tsx → wagmi-direct (keeps demos running during migration)
└── providers/
    ├── TransactionNotificationProvider.tsx  → legacy toast system (useWeb3Status + readOnlyClient)
    └── TransactionNotificationProvider.test.tsx
```

**Layering violation:** `TransactionButton` and `SignButton` are Chakra-styled (import `PrimaryButton`, `SwitchChainButton`). They should move to `@dappbooster/chakra`. The hooks they wrap (`useTransaction`, `useWallet`, `useChainRegistry`) are the real SDK surface.

**Blocker:** `TransactionNotificationProvider` depends on `useWeb3Status().readOnlyClient` for tx watching. This is the main coupling that prevents full adapter-native notification. Replace with `createNotificationLifecycle` wired as global lifecycle hooks in `DAppBoosterProvider` config.

**Phase 3 actions:**
- Move `TransactionButton.tsx` and `SignButton.tsx` to `@dappbooster/chakra`
- Replace `TransactionNotificationProvider` with `createNotificationLifecycle` as global lifecycle
- Delete `providers.ts` barrel entirely — notification behavior moves to lifecycle hooks
- Delete `LegacyTransactionButton.tsx` after demo migration to adapter-based `TransactionButton`

### src/tokens/

**Structure:**
```
src/tokens/
├── components.ts    → barrel (TokenDropdown, TokenInput, TokenLogo, TokenSelect)
├── hooks.ts         → barrel (useTokenInput, useErc20Balance, useTokenLists, useTokenSearch, useTokens)
├── types.ts         → barrel (Token, TokenList, Zod schemas)
├── config/tokenLists.ts      → token list URLs (pure data)
├── types/index.ts            → Zod schemas + types (pure)
├── utils/tokenListsCache.ts  → fetch cache (pure)
├── hooks/
│   ├── useErc20Balance.ts    → wagmi useReadContract (EVM-specific, app-level)
│   ├── useTokenLists.ts      → Suspense fetch + parse (framework-agnostic)
│   ├── useTokenSearch.ts     → filter/search (pure logic)
│   └── useTokens.ts          → LI.FI SDK (uses useWeb3Status ⚠️)
└── components/               → ALL Chakra-styled
    ├── TokenDropdown, TokenLogo, TokenInput/, TokenSelect/
    └── TokenSelect uses useWeb3Status in index.tsx + AddERC20TokenButton.tsx ⚠️
```

**Layering:** All components are Chakra-styled → `@dappbooster/chakra`. Types/config/utils are pure → `@dappbooster/core`. Hooks split between `@dappbooster/react` (useTokenLists, useTokenSearch, useTokens) and app-level (useErc20Balance is EVM-specific wagmi hook → `templates/evm-defi`).

**`useWeb3Status` coupling (3 files):** `useTokens.ts:80`, `TokenSelect/index.tsx:64`, `AddERC20TokenButton.tsx:23`. All only need connected address and chain info — straightforward swap to `useWallet().status.activeAccount` and `useWallet().status.connectedChainIds`. Not a deep refactor, just import changes.

**Phase 3 actions:**
- Swap `useWeb3Status` → `useWallet` in the 3 files above
- Move `types/`, `config/`, `utils/` to `@dappbooster/core`
- Move `hooks/useTokenLists`, `useTokenSearch`, `useTokens` to `@dappbooster/react`
- Move `hooks/useErc20Balance` to `templates/evm-defi` (app-level, EVM-specific)
- Move all `components/` to `@dappbooster/chakra`

### src/core/

**The messiest domain — catch-all for everything not wallet/transactions/tokens. Mixes pure utilities, app config, and Chakra UI.**

**Structure:**
```
src/core/
├── components.ts   → barrel: 30+ Chakra UI exports (single large barrel ⚠️)
├── utils.ts        → barrel: address, hash, numberFormat, strings, suspenseWrapper
├── types.ts        → barrel: chains, transports, ChainsIds, isDev
├── hooks.ts        → barrel: useNetworkBlockNumber (EVM-specific)
├── config/         → app-level chain config (chains[], transports{})
├── types/          → RequiredNonNull type helper (pure)
├── utils/          → mix of pure utils + legacy getExplorerLink + Chakra-coupled suspenseWrapper
├── hooks/          → useNetworkBlockNumber (wagmi useBlockNumber wrapper)
└── ui/             → ALL Chakra-styled (theme, shell, primitives, data display, devtools)
```

**Layering issues:**

1. `suspenseWrapper.tsx` imports Chakra `Spinner` as default fallback — should be in `@dappbooster/chakra`, or accept fallback prop with no default styling
2. `getExplorerLink.ts` is legacy — SDK has `getExplorerUrl` in `src/sdk/core/chain/explorer.ts` using ChainRegistry. Delete once consumers migrate.
3. `networks.config.ts` is app-level config (chain list + transports) — belongs in `templates/evm-defi`, not SDK
4. `components.ts` is one large barrel for 30+ Chakra components — no signal about what's SDK-portable vs app-specific

**Package mapping:**

| Current | Package | Reason |
|---|---|---|
| `utils/address`, `hash`, `strings`, `numberFormat`, `logger`, `DeveloperError` | `@dappbooster/core` | Pure, no React |
| `utils/getExplorerLink` | Delete | Replaced by SDK `getExplorerUrl` |
| `utils/getTransactionOutputs` | `@dappbooster/core` (EVM utils) | viem receipt parsing |
| `utils/suspenseWrapper` | `@dappbooster/chakra` or headless version to `@dappbooster/react` | Chakra-coupled |
| `types/utils` | `@dappbooster/core` | Pure type helper |
| `config/common`, `config/networks.config` | `templates/evm-defi` | App-level |
| `hooks/useNetworkBlockNumber` | `templates/evm-defi` | EVM-specific wagmi hook |
| `ui/**` (entire folder) | `@dappbooster/chakra` + `templates/` | Header/Footer/theme → template; reusable primitives → chakra package |

### src/contracts/

**Structure:**
```
src/contracts/
├── abis/              → demo ABIs (Aave, ENS, OPL1CrossDomainMessenger)
├── definitions.ts     → contract registry (name + ABI + addresses per chain)
├── generated.ts       → gitignored, auto-generated by pnpm wagmi-generate
├── hooks/             → hand-written wagmi hooks (demo-specific)
└── wagmi/
    ├── config.ts                    → wagmi-cli defineConfig
    └── plugins/reactSuspenseRead.ts → custom Suspense hook generator plugin
```

**No barrel file** — consumers import directly from `./definitions` or `./generated`. This is correct since `generated.ts` is the primary surface.

**Everything is app-specific and EVM-specific** except `reactSuspenseRead.ts` plugin. ABIs, definitions, hooks, and wagmi config are all per-app.

**`reactSuspenseRead.ts` is the only SDK-worthy piece.** Generates Suspense-compatible read hooks from any contract ABI. Should ship with the EVM adapter package. The `walletConfigImport` string on line 9 is currently hardcoded — needs to become configurable or use a convention-based path.

**Phase 3 actions:**
- Move `wagmi/plugins/reactSuspenseRead.ts` to `@dappbooster/core` EVM utils — make config import path configurable
- Move everything else to `templates/evm-defi` (app-specific contracts/hooks/codegen config)
- The `definitions.ts` contract registry pattern is good — document it as the recommended pattern for contract management in templates

### src/data/

**Structure:**
```
src/data/
├── types.ts                → empty placeholder (export {})
└── adapters/subgraph/
    ├── codegen.ts           → subgraph codegen config (@bootnodedev/db-subgraph)
    ├── gql/                 → auto-generated GraphQL types (gitignored)
    └── queries/             → hand-written GraphQL queries (aave, uniswap)
```

**100% app-specific.** No layering issues, no deprecated hook coupling. Subgraph queries are demo data.

**Phase 3 actions:**
- Move everything to `templates/evm-defi`
- Delete empty `types.ts` placeholder
- Consider whether `@bootnodedev/db-subgraph` codegen pattern should become a formal data adapter interface in the SDK (future, not blocking)

---

## Blocked Migration Chains

### Chain 1: Notification system → Demo migration

```
1. Replace TransactionNotificationProvider with createNotificationLifecycle as global lifecycle hooks
   └── Blocked by: useWeb3Status().readOnlyClient usage in notification provider
   └── Files: src/transactions/providers/TransactionNotificationProvider.tsx
              src/routes/__root.tsx (mounts the provider)

2. Once notifications are adapter-native, migrate demo pages off LegacyTransactionButton
   └── Files: src/components/pageComponents/home/Examples/demos/TransactionButton/**
              src/components/pageComponents/home/Examples/demos/OptimismCrossDomainMessenger/
   └── Each demo needs to construct TransactionParams instead of () => Promise<Hash>

3. Delete LegacyTransactionButton
   └── File: src/transactions/components/LegacyTransactionButton.tsx
```

### Chain 2: Read-only path → Token infra migration

```
1. Expand useReadOnly to full spec contract (address param, explorerAddressUrl, auto-contributed factories)
   └── File: src/sdk/react/hooks/useReadOnly.ts

2. Migrate token infrastructure off useWeb3Status
   └── Files: src/tokens/hooks/useTokens.ts (uses useWeb3Status at line 77)
              src/tokens/components/TokenSelect/** (multiple files use useWeb3Status)
              src/tokens/components/TokenInput/** (uses useWeb3Status indirectly)
              src/components/pageComponents/home/Examples/demos/TokenInput/index.tsx

3. Delete useWeb3Status and useWalletStatus
   └── Files: src/wallet/hooks/useWeb3Status.tsx
              src/wallet/hooks/useWalletStatus.ts
              src/hooks/useWeb3Status.tsx (old location)
              src/hooks/useWalletStatus.ts (old location)
```

---

## SDK API Gaps (Spec → Implementation)

### Error handling documentation gap

Error classes are well-designed (typed, contextual properties, accurate JSDoc). But agents need a per-user-action error decision tree, not just per-class "thrown when" docs. Examples:

- "user clicks Connect" → `WalletNotInstalledError`, `WalletConnectionRejectedError`, `ChainNotSupportedError`
- "user clicks Send Transaction" → `WalletNotConnectedError`, `AdapterNotFoundError`, `TransactionNotReadyError`, `InsufficientFundsError`, `PreStepsNotExecutedError`

Also document: which errors does the hook handle internally (set `error` state) vs which propagate to the consumer (must try/catch). Currently `useTransaction` catches and sets state; `useWallet` methods are raw passthroughs.

Overlap between `ChainNotSupportedError` (adapter-internal: "this adapter doesn't support that chain") and `AdapterNotFoundError` (hook-level: "no adapter found for that chain") needs clarification — both mean "this chain doesn't work" to a consumer.

**Action:** Add consumer error handling guide to spec — organized by user action, not by error class.

### Duplicated wallet lifecycle dispatch logic

`fireWalletLifecycle` is defined identically in both `useWallet.ts` and `useMultiWallet.ts`. `useMultiWallet` also has `wrapSignMessage`/`wrapSignTypedData` helpers that `useWallet` inlines as `useCallback`s.

**Phase 3 action:** Extract shared `fireWalletLifecycle`, `wrapSignMessage`, `wrapSignTypedData` into `src/sdk/react/internal/walletLifecycle.ts`. Both hooks import from there. Prevents drift if lifecycle dispatch logic changes.

### SDK react components are NOT headless

`src/sdk/react/components/` contains `ConnectWalletButton` and `WalletGuard` which both import Chakra-styled components from `src/wallet/components/` (`ConnectButton`, `SwitchChainButton`). This means `@dappbooster/react` has a transitive Chakra dependency through these components.

**Phase 3 action (hard requirement — no styling in react package):**
- Move `ConnectWalletButton.tsx` and `WalletGuard.tsx` to `@dappbooster/chakra`
- `@dappbooster/react` keeps ONLY hooks, provider, and lifecycle factory (all headless)
- Or make these components headless via render props: `WalletGuard` accepts `renderConnect`/`renderSwitchChain` callbacks instead of importing styled components directly

`createNotificationLifecycle.ts` is correctly headless (injected `ToasterAPI`) and stays in `@dappbooster/react`.

### core/index.ts uses export * — collision risk

`src/sdk/core/index.ts` re-exports everything via `export *` from adapters, chain, errors, evm, utils. Currently no name collisions, but when Phase 4 adds non-EVM adapters (SVM, Cosmos), two adapter packages exporting similarly-named factories (e.g., `createSvmWalletAdapter`) could clash.

**Phase 4 action:** Consider switching from `export *` to explicit named re-exports, or namespace EVM exports under a sub-path (`@dappbooster/core/evm`).

### createEvmWalletAdapter React coupling — MUST split

`src/sdk/core/evm/wallet.tsx` lives in `core/` but imports React (`WagmiProvider`, `QueryClientProvider`, `FC`, `ReactNode`) because the factory returns a `Provider` component as part of `WalletAdapterBundle`. The adapter *logic* (connect, disconnect, signMessage, etc.) uses `@wagmi/core` actions which ARE framework-agnostic — only the bundle wrapping is React-specific.

**Phase 3 action (hard requirement — no React in core):**
- `createEvmWalletAdapter(config)` → returns `WalletAdapter<'evm'>` only. Stays in `@dappbooster/core`. File becomes `.ts` (no JSX). All `@wagmi/core` action-based logic stays here.
- `createEvmWalletBundle(config)` → calls `createEvmWalletAdapter` internally, wraps result with `WagmiProvider` + `QueryClientProvider` + connector `WalletProvider` + `useConnectModal`. Lives in `@dappbooster/react/evm`. Returns `WalletAdapterBundle`.
- `WalletAdapterBundle` type stays in `@dappbooster/core/adapters/provider.ts` (it's a type, not runtime React code — the `Provider` and `useConnectModal` fields are optional and typed with React types via peer dep).

This is a clean cut — the adapter logic doesn't reference React at all today. The only React code is the 7-line `Provider` component and the `useConnectModal` passthrough at the bottom of the factory.

### Must implement in Phase 3

| Gap | Spec reference | Implementation file | Notes |
|---|---|---|---|
| Manual pre-step control | `executePreStep(index)`, `executeAllPreSteps()` | `src/sdk/react/hooks/useTransaction.ts` | State machine for per-step approval UX |
| Multi-chain WalletGuard | `require: WalletRequirement[]` | `src/sdk/react/components/WalletGuard.tsx` | Array of chainId/chainType requirements for bridge pattern |
| useMultiWallet convenience methods | `getWallet(chainType)`, `getWalletByChainId(chainId)`, `connectedAddresses` | `src/sdk/react/hooks/useMultiWallet.ts` | Derived from existing record |
| useReadOnly address + explorer | `address` param, `explorerAddressUrl` return | `src/sdk/react/hooks/useReadOnly.ts` | Blocked on read-only factory auto-contribution |
| Transforming wrapAdapter hooks | `beforePrepare`, `afterExecute` that modify data | `src/sdk/core/utils/wrap-adapter.ts` | Currently observation-only; needed for FHE use case |
| ConnectWalletButton avatar/ENS | Adapter-agnostic avatar display | `src/sdk/react/components/ConnectWalletButton.tsx` | Build on `useReadOnly(address)` for ENS resolution |

### XState migration for transaction state machine (Phase 4)

The DbC annotations on `useTransaction` define an implicit state machine: `idle → prepare → preStep → submit → confirm → idle` with guards (preconditions), transitions (postconditions), and error transitions (throws). The current implementation uses `useState` + refs to manually track phases.

**Phase 4 action:** Migrate to XState:
- Machine definition in `@dappbooster/core` (framework-agnostic — XState machines are pure JavaScript)
- React binding via `@xstate/react`'s `useMachine` in `@dappbooster/react`
- Lifecycle hooks become XState actions attached to transitions
- `UseTransactionReturn` interface stays the same — consumers don't know it's XState underneath
- Pre-step state machine (pending/executing/completed/failed) maps to XState's parallel states
- Benefits: visual state chart tooling, impossible-state prevention at compile time, easier testing of transition logic

### Known UX issues

| Issue | Location | Fix approach |
|---|---|---|
| Demo dialog z-index vs RainbowKit modal | `src/components/pageComponents/home/Examples/Item/index.tsx` | Adjust z-index or close demo dialog when connect modal opens |

---

## Duplicate File Cleanup

Files that exist at both old and new locations. Old location should be deleted in Phase 3.

```
Old: src/hooks/useWeb3Status.tsx          → New: src/wallet/hooks/useWeb3Status.tsx
Old: src/hooks/useWalletStatus.ts         → New: src/wallet/hooks/useWalletStatus.ts
Old: src/providers/Web3Provider.tsx        → New: src/wallet/providers/Web3Provider.tsx
Old: src/providers/TransactionNotificationProvider.tsx → New: src/transactions/providers/TransactionNotificationProvider.tsx
Old: src/components/sharedComponents/TransactionButton.tsx → New: src/transactions/components/TransactionButton.tsx
Old: src/components/sharedComponents/SignButton.tsx → New: src/transactions/components/SignButton.tsx
Old: src/components/sharedComponents/WalletStatusVerifier.tsx → New: src/wallet/components/WalletStatusVerifier.tsx
```

**Warning:** Any component importing from old paths gets a DIFFERENT React context than components importing from new paths. This was the root cause of runtime context mismatch bugs found during review.

---

## wagmi Config Sharing Rule

**Critical for agents:** The app must use exactly ONE wagmi `Config` instance at runtime.

```
Single source of truth: src/wallet/connectors/wagmi.config.ts
  ├── Imported by: src/routes/__root.tsx (passes to createEvmWalletAdapter via wagmiConfig param)
  └── Referenced by: src/contracts/wagmi/plugins/reactSuspenseRead.ts (walletConfigImport string, line 9)
```

To switch connectors, change ONE import in `wagmi.config.ts`. Both the SDK adapter and generated contract hooks automatically use the same config.

---

## EVM Library Coupling

wagmi + viem are structural dependencies of the EVM adapter, not swappable. See spec section "EVM library coupling (explicit constraint)" for full details. Adding non-EVM chains (SVM, Cosmos) is the designed extension point. Replacing wagmi with ethers.js for EVM is a full rewrite.

---

## Review Session Commits Reference

Fixes applied during code review that are now squashed into the 15 clean commits:

- `connect()` validates chainId against supportedChains
- `useTransaction` gates on `prepare.ready`, dispatches `onReplace`
- Per-adapter connect modal resolution (bridge components)
- `AdapterNotFoundError` for not-found cases (was `AmbiguousAdapterError`)
- `CapabilityNotSupportedError` for unsupported `signTypedData`
- `TransactionNotReadyError` when prepare returns `ready: false`
- Provider validates `chainType` vs `supportedChains` consistency
- Registry normalizes chainId string/number for cross-type lookups
- Structural dedup preserves `ChainRegistryConflictError`
- Modal cleanup on bridge unmount
- Provider perf (derived `walletEntries` inside `useMemo`)
- viem API fixes (`replacement.transactionReceipt`, `privateKeyToAccount` path)
- Notification provider error toast type + double-await fix
- Shared wagmi config between adapter and generated hooks
- Centralized connector choice in `wagmi.config.ts`
- react-jazzicon CJS interop for Vite 8
- `openAccountModal` for disconnect/account management
