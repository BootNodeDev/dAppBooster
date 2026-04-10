Closes #

# Description

Implements **Phases 1 and 2** of the [adapter architecture](docs/architecture/adapter-architecture-spec.md), transforming dAppBooster from an EVM-only starter template into a chain-agnostic, headless-first SDK.

**Phase 1 -- Introduce adapters alongside existing code (no breaking changes):**

- Chain-agnostic primitives: `ChainDescriptor`, `ChainRegistry`, `getExplorerUrl`
- Adapter interfaces: `WalletAdapter`, `TransactionAdapter`, `TransactionLifecycle`, `WalletLifecycle`
- EVM implementations: `createEvmWalletAdapter` (wagmi/actions), `createEvmTransactionAdapter` (viem), `createEvmServerWallet` (private key signer)
- Three connector wrappers: ConnectKit, RainbowKit, Reown -- each exposing `useConnectModal` hook with `openAccount` support
- Pre-step helpers: `createApprovalPreStep`, `createPermitPreStep`
- `wrapAdapter` utility for adapter composition (logging, analytics)
- Typed error hierarchy (14 error classes including `AdapterNotFoundError`, `TransactionNotReadyError`, `CapabilityNotSupportedError`)
- `DAppBoosterProvider` with per-adapter connect modal resolution via bridge components
- React hooks: `useWallet`, `useTransaction`, `useMultiWallet`, `useReadOnly`, `useChainRegistry`

**Phase 2 -- Migrate internals to adapter-backed hooks:**

- `TransactionButton` -> `useTransaction()` + `useWallet()`
- `SignButton` -> `useWallet().signMessage()` + `useChainRegistry()`
- `WalletGuard` replaces `WalletStatusVerifier` (accepts `chainId` and `chainType` for adapter resolution)
- `ConnectWalletButton` is adapter-agnostic (uses `useWallet` + `openConnectModal`/`openAccountModal`, no wagmi imports)
- Default connect fallbacks scoped to target chain via `chainId`/`chainType`
- Legacy hooks (`useWeb3Status`, `useWalletStatus`) marked `@deprecated`
- Wallet lifecycle hooks (`onSign`, `onSignComplete`, `onSignError`) dispatched during signing flows
- Domain folder reorganization: `src/wallet/`, `src/transactions/`, `src/tokens/`, `src/contracts/`, `src/core/`, `src/data/`
- Shared wagmi config (`src/wallet/connectors/wagmi.config.ts`) ensures SDK adapter and generated contract hooks use a single config instance
- `useProviderContext` removed from public barrel exports (internal-only hook)

**Phase 2 pending (tracked in spec, deferred to next PR):**

These are sequential — each unblocks the next:

1. **Expand `useReadOnly`** to accept address param and auto-contribute read factories from adapters (currently minimal stub)
2. **Migrate token infrastructure** (`useTokens`, `TokenSelect`, `AddERC20TokenButton`) off deprecated `useWeb3Status` → use `useWallet` + `useReadOnly` (blocked by step 1)
3. **Replace `TransactionNotificationProvider`** with `createNotificationLifecycle` wired as global lifecycle hooks in `DAppBoosterProvider` config (depends on `useWeb3Status` removal from step 2)
4. **Migrate demo pages** off `LegacyTransactionButton` → adapter-based `TransactionButton` with `TransactionParams` (blocked by step 3 — demos need notifications working)

**Review fixes included:**

- `connect()` validates chainId against supportedChains (`ChainNotSupportedError`)
- `useTransaction` gates submission on `prepare.ready` (`TransactionNotReadyError`), dispatches `onReplace` lifecycle on tx replacement
- Per-adapter connect modal resolution via bridge components (replaces single global `useConnectModal`)
- `openAccountModal` added to connector hooks for disconnect/account management (RainbowKit uses separate modal, ConnectKit/Reown use single modal for both)
- `AdapterNotFoundError` for not-found cases in both `useTransaction` and `useWallet` (was incorrectly using `AmbiguousAdapterError`)
- `CapabilityNotSupportedError` for unsupported `signTypedData`
- Provider validates adapter `chainType` vs `supportedChains` consistency at initialization
- Registry normalizes chainId string/number for cross-type lookups
- Structural dedup preserves `ChainRegistryConflictError` for genuinely conflicting chain descriptors
- Stale modal registration cleanup on bridge component unmount
- Provider performance fix (derived `walletEntries` inside `useMemo` to avoid unnecessary context rebuilds)
- Legacy `ConnectWalletButton` imports repointed from `Web3Provider` to SDK path (eliminates dual import surface)
- viem API corrections (`replacement.transactionReceipt`, `privateKeyToAccount` from `viem/accounts`)
- `TransactionNotificationProvider` error toast type fix (was showing errors as success) and double-await elimination in `watchTx`
- Connector migration from `ConnectWalletButton` component to `useConnectModal` hook across all 3 connectors
- Shared wagmi config between SDK adapter and generated contract hooks (fixes generated hooks reading from wrong chain)
- Centralized connector choice in `wagmi.config.ts` as single source of truth
- react-jazzicon CJS interop fix for Vite 8 double-wrapped default export
- Design by Contract enforcement: `@precondition`, `@postcondition`, `@throws`, `@invariant` JSDoc annotations on all public SDK methods matching spec contracts. Added missing runtime precondition checks (`switchChain` connected guard, `execute` chain support validation)

**Architecture spec updated** ([docs/architecture/adapter-architecture-spec.md](docs/architecture/adapter-architecture-spec.md)):

- All interface definitions aligned with implemented code (async `getSigner`, `useConnectModal` hook pattern, params-at-execute pattern for `useTransaction`)
- Phase 3 markers for: manual pre-step control, multi-chain WalletGuard, transforming adapter hooks, useReadOnly address/explorer, useMultiWallet convenience methods, ConnectWalletButton avatar/ENS, demo dialog z-index fix
- Use case matrix with status column and agent implementation guide with deterministic resolution rules
- wagmi config sharing rule documented (single config instance requirement)
- EVM library coupling constraint explicitly documented (wagmi+viem structural dependency, not swappable)
- DataAdapter interface noted as Phase 4+ design consideration

# Steps

1. `pnpm install`
2. `cp .env.example .env.local` (set `PUBLIC_APP_NAME` and `PUBLIC_WALLETCONNECT_PROJECT_ID`)
3. `pnpm dev` -- app runs with `DAppBoosterProvider` + ConnectKit connector
4. Connect wallet, verify connection state in header
5. Navigate to demo pages -- transaction demos use `LegacyTransactionButton`, signing demos work via new SDK hooks
6. Verify connector swap: change one import in `src/wallet/connectors/wagmi.config.ts` (e.g. `connectkitConnector` to `rainbowkitConnector` or `reownConnector`)

## Type of change

- [x] New feature
- [x] Bug fix
- [ ] Breaking change
- [x] Enhancement
- [x] Refactoring
- [ ] Chore

# How Has This Been Tested?

- [x] Manual testing
- [x] Automated tests
- [ ] Other (explain)

509 tests passing (65 test files). Full `tsc --noEmit` clean. Biome lint clean. Pre-commit hooks (lint-staged + vitest related) and commitlint pass on all commits. Manual testing of wallet connection, connector swap, and demo page flows.

# Remember to check that

- [x] Your code follows the style guidelines of this project
- [x] You have performed a self-review of your code
- [x] You have commented your code in hard-to-understand areas
- [x] You have made corresponding changes to the documentation
- [x] Your changes generate no new warnings

# Screenshots

N/A -- no visual changes. UI components preserve existing Chakra styling. The adapter architecture is a structural/API change.
