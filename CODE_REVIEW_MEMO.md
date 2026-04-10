# Code Review Memo: feat/huge-auto-refactor

**Branch:** feat/huge-auto-refactor (vs develop)  
**Date Review Started:** April 6, 2026  
**Status:** ✅ Phase 2 immediate fixes applied; Phase 3 backlog queued

---

## Scope Summary

- **Snapshot refreshed:** April 6, 2026
- **Commits vs `develop`:** 52
- **Files changed vs `develop`:** 256
- **Insertions / Deletions vs `develop`:** 21,336 / 1,823
- **Working tree entries at snapshot time:** 32

---

## Phase Breakdown

### Phase 1: Initial Analysis

- [x] **Understanding the Refactor Objective**
  - What's the main goal/theme?
  - What subsystems are affected?
  - High-level architecture changes?

- [x] **Commit Pattern Analysis**
  - Grouping commits by domain (SDK, adapters, components, etc.)
  - Identifying breaking changes vs. non-breaking
  - Spotting potential conflicts or regressions

- [x] **Change Volume Assessment**
  - Which files have the most changes?
  - Which areas need the most scrutiny?

### Phase 2: Deep Dives (by Domain)

- [x] **SDK Core Architecture** (adapters, chain registry, wallet layer)
- [x] **React Hooks & Provider** (DAppBoosterProvider, context, hooks)
- [x] **Component Migrations** (TransactionButton, SignButton, WalletGuard)
- [x] **Configuration & Setup** (env, connectors, token lists)
- [x] **Tests & Coverage** (verify new tests, check for gaps)

### Phase 3: Risk Assessment

- [x] Type safety concerns
- [x] Backwards compatibility issues
- [x] Edge cases and error handling
- [x] Performance implications

### Phase 4: Final Recommendations

- [x] Must-fix issues
- [x] Nice-to-have improvements
- [x] Documentation gaps
- [x] Testing gaps

### Phase 3 Execution Backlog

- [ ] Finding 1: manual pre-step control API (`executePreStep`, `executeAllPreSteps`, state machine)
- [ ] Finding 4: adapter-native notifications + `onReplace` lifecycle propagation
- [ ] Finding 5: expand `useReadOnly` contract for Phase 3 read-only/multi-chain needs
- [ ] Finding 6: migrate token infrastructure off deprecated wallet hooks (after Finding 5)

---

## Uncommitted Changes Status

**Build Status:** ✅ Passes (`pnpm build`)  
**Dev Server:** ✅ Running (`pnpm dev`)  
**Runtime Issues:** ✅ Addressed

### Critical Fixes Applied

1. **DAppBoosterProvider.tsx** — Major architectural fix
   - **Before:** Hardcoded `<Web3Provider>` wrapping (EVM+ConnectKit only)
   - **After:** Dynamically mounts wallet adapter Providers — truly adapter-agnostic
   - **Impact:** Enables multi-wallet, multi-chain support per spec
   - **Status:** ✅ CRITICAL — foundational fix

2. **EVM Connector Layer** (connectkit, reown, rainbowkit)
   - Decoupled from legacy `@/src/wallet` imports
   - Inlined WalletProvider + useConnectModal resolution
   - All three now follow consistent pattern
   - **Status:** ✅ Pattern consistency achieved

3. **wallet.test.ts** — Test infrastructure fixes
   - Added wagmi `mock` connector for testing
   - Created `makeConfig({ withConnector })` helper
   - Added proper type assertions
   - **Status:** ✅ Tests now properly initialized

4. **Component tests** (TransactionButton, SignButton, demos)
   - Updated for new hook signatures
   - Still in flight per demo files
   - **Status:** ⚠️ Migration completing

5. **useReadOnly.test.ts** — Dead-code cleanup (26 lines removed)
   - Removed: Unused `WalletAdapter` import + `makeMockAdapter()` function
   - Reason: useReadOnly is zero-adapter use case; mock never called
   - Result: Test is cleaner, stays focused on actual behavior
   - **Status:** ✅ Good cleanup

---

## Findings Log

### Phase 1: Current Architecture Validation

**Refactor Pattern Identified:**

1. **Folder reorganization** — domain-based structure with barrels ✅
2. **Type foundation** — error classes, ChainDescriptor, ChainRegistry ✅
3. **Adapter interfaces** — WalletAdapter, TransactionAdapter ✅
4. **EVM implementations** — connectors, wallet, transaction adapters ✅
5. **React integration** — DAppBoosterProvider, hooks (useWallet, useTransaction, etc.) ✅
6. **Component migration** — Old components refactored to use new adapters ✅
7. **Deprecation** — Legacy wallet utilities marked deprecated ✅

**Fidelity to Spec:**

- Adapter-agnostic design ✅ (confirmed by Provider fix)
- Chain registry with CAIP-2 ✅
- Lifecycle hooks for notifications ✅
- Sequential phases match commit log ✅

**Build/Runtime Validation:**

- Build now passes ✅  
- Dev server running ✅
- Critical fixes applied ✅
- All uncommitted changes are deliberate, well-reasoned cleanups ✅
- **Phase 1 Complete** ✅ Ready for Phase 2

### Phase 2: Deep Dive Domains

- ✅ **Issue 1 closed** (`8d441e0`): `connect()` now validates requested `chainId` against `supportedChains` and throws `ChainNotSupportedError` for unsupported values.
- ✅ **Issue 2 confirmed valid**: `TransactionAdapter.execute()` already performed signer boundary validation (`isWalletClient` + `InvalidSignerError`).
- ✅ **Issue 3 confirmed by design**: lifecycle hook failures are logging-only and do not contaminate transaction state.
- ✅ **Issue 4 closed** (`f616cff`): `useTransaction` now throws `AdapterNotFoundError` for missing wallet/transaction adapter instead of `AmbiguousAdapterError`.

#### Follow-up fixes validated in subsequent commits

- ✅ `e13950d`: wallet lifecycle dispatch (`onSign`, `onSignComplete`, `onSignError`) added in `useWallet` and `useMultiWallet` signing flows.
- ✅ `d16ba83`: `ConnectWalletButton` made chain-agnostic by resolving through `useWallet`.
- ✅ `1a01bbc`: single `useConnectModal` replaced with per-adapter modal resolution.
- ✅ `e7e46e7`: `useWallet` resolution now uses `AdapterNotFoundError` for not-found cases (semantic fix).
- ✅ `e20fdcf`: connect modal bridge now unregisters on unmount (stale modal cleanup).
- ✅ `b21c4d6`: tests added for `openConnectModal` targeting correct adapter + no-op safety.

#### Validation status

- ✅ Targeted test run (provider/hooks/errors set): passing (`87 passed, 0 failed`)
- ✅ Earlier focused run also passing (`63 passed, 0 failed`)

### Phase 3: Risk Assessment

- 🔄 **Compatibility audit completed (current pass)**

#### Findings (ordered by severity)

1. ⚠️ **Medium:** Active `TransactionNotificationProvider` is still coupled to deprecated `useWeb3Status` / wagmi read client.
   - Current runtime path in `src/routes/__root.tsx` mounts `TransactionNotificationProvider` from `src/transactions/providers`.
   - Provider implementation uses `useWeb3Status()` and `readOnlyClient.waitForTransactionReceipt(...)` in `src/transactions/providers/TransactionNotificationProvider.tsx`.
   - Risk: this path remains EVM-centric and bypasses the adapter abstraction, which can become a compatibility bottleneck for true multi-chain adapter rollout.

2. ✅ **Closed** (`2e9e347`): `ConnectWalletButton` import surface cleanup completed.
   - Shared components were repointed away from `@/src/providers/Web3Provider`.
   - Current scan shows no remaining runtime imports from `@/src/providers/Web3Provider`.
   - Note: one test mock string remains in `src/hooks/useWeb3Status.test.ts` and is not a runtime import path.

3. ⚠️ **Low:** Legacy/deprecated wallet APIs are still referenced in demos and compatibility layers.
   - Examples include `LegacyTransactionButton`, `WalletStatusVerifier`, `useWeb3StatusConnected`, and `useWalletStatus` in demo flows.
   - This is currently intentional and documented with deprecation annotations, but should remain tracked until migration completion.

#### Risk conclusion

- ✅ No new high-severity regressions found.
- ✅ Current single-EVM runtime remains coherent.
- ⚠️ Primary remaining architectural debt is notification plumbing not yet adapter-native.
- ℹ️ Items 1 and 3 are intentionally deferred to the planned Phase 2 → Phase 3 migration work.

---

## Key Decisions & Blockers

- ✅ **Confirmed:** All uncommitted changes are intentional and well-justified
- Provider architecture correctly implements adapter-agnostic design per spec
- ✅ Prior high-severity blockers from Phase 2 have been addressed by commits listed above.
- ⚠️ Remaining work is mainly migration planning/compatibility cleanup, not core architectural correctness.
- ✅ ConnectWalletButton import-surface blocker is resolved (`2e9e347`).
- ⚠️ Main merge consideration remains whether adapter-native notification refactor is required now or accepted as follow-up.

---

## Outcome Update (Applied Now)

The following review items were fixed immediately and are now present on branch `feat/huge-auto-refactor`:

1. ✅ `188e880` — **Fix 2**: scoped default `ConnectWalletButton` with `chainId`/`chainType` in `TransactionButton`, `SignButton`, and `WalletGuard`.
2. ✅ `340ad15` — **Fix 3**: switched to structural dedup so identical descriptors are deduped while preserving `ChainRegistryConflictError` for genuine conflicts.
3. ✅ `d8f0882` — **Fix 7a**: replaced generic `Error` with `CapabilityNotSupportedError` in `useWallet.signTypedData` unsupported path.
4. ✅ `483534d` — **Fix 8**: derived `walletEntries` inside `useMemo` to avoid unnecessary provider context rebuilds.

### Reclassification to Phase 3 (Tracked)

The following findings are intentionally deferred and tracked as Phase 3 work:

1. **Finding 1 (High): Pre-step manual control API gap**
   - Current behavior (`autoPreSteps` default true + throw-only when false) is acknowledged.
   - Reclassified as **Phase 2-incomplete API surface**, not a current runtime blocker for merge.
   - Planned as dedicated task: add manual pre-step execution state machine (`executePreStep`, `executeAllPreSteps`, progress/index tracking).

2. **Finding 4 (Medium): Notification/lifecycle migration incompleteness**
   - Already triaged for Phase 3.
   - Includes `onReplace` propagation gap from adapter confirm path into hook lifecycle firing.

3. **Finding 5 (Medium): Read-only path narrower than spec**
   - `useReadOnly` currently exists as a minimal/stubbed path.
   - Deferred to Phase 3 for full spec parity (richer contract + read-only multi-chain scenarios).

4. **Finding 6 (Medium): Remaining deprecated-hook coupling in token infra**
   - Acknowledged as real coupling.
   - Treated as dependent on completing Finding 5 first (adapter-native read path), then migrated in Phase 3.

---

## Next Action

⏳ **PHASE 3 planning and execution**

- Open and prioritize Phase 3 tasks for Findings 1/4/5/6.
- Keep runtime-stability-first merge scope for current Phase 2 branch.
- Track notification/lifecycle and read-only migration dependencies explicitly.

---

## Phase 4: Final Verdict

### Merge recommendation

- ✅ **Merge with conditions**

### Must-fix in this review pass

- None.

### Merge conditions

1. Keep the current commits that resolved Phase 2 blockers and compatibility fixes:
   - `8d441e0`, `f616cff`, `e13950d`, `d16ba83`, `1a01bbc`, `e7e46e7`, `e20fdcf`, `b21c4d6`, `2e9e347`, `188e880`, `340ad15`, `d8f0882`, `483534d`
2. Preserve green status for focused test suites covering provider/hooks/errors and modal-resolution behavior.

### Follow-up scope (explicitly deferred)

1. Pre-step manual control API completion (`executePreStep`, `executeAllPreSteps`, explicit pre-step state machine).
2. Adapter-native notification internals migration (`TransactionNotificationProvider` decoupling from deprecated `useWeb3Status`) plus `onReplace` lifecycle propagation.
3. `useReadOnly` contract expansion for Phase 3 read-only/multi-chain requirements.
4. Token infra migration off deprecated wallet hooks after read-only adapter path is complete.
5. Demo migration off legacy wallet/status components once the above runtime migrations land.

### Residual risk statement

- Current runtime is stable for the existing EVM-focused app path.
- Main residual architectural risk is future multi-chain extensibility in notification plumbing, which is already scoped as follow-up work.
