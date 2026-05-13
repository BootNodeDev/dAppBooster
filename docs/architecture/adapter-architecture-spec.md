# dAppBooster Adapter Architecture Spec

> **Status:** Phase 2 implementation complete — spec aligned with `feat/huge-auto-refactor`
> **Date:** 2026-04-06 (updated)
> **Branch:** `feat/huge-auto-refactor`
> **Depends on:** Domain folder reorganization (Task 1, commit `30e00e46b`)

## Overview

This spec defines a chain-agnostic adapter architecture for dAppBooster, transforming it from an EVM-only starter template into a multi-chain, headless-first blockchain interaction SDK.

The architecture enables dAppBooster to serve as the go-to SDK for **any** blockchain UI — from single-chain DeFi apps to cross-chain bridges, portfolio trackers, agent scripts, CLI tools, and backend relayers — using the same core primitives.

### Design principles

- **Headless-first.** Logic has zero UI dependencies. Styling is opt-in.
- **Adapter-based.** Each chain type implements standard interfaces. The SDK is chain-agnostic.
- **Layered escape hatches.** Components → hooks → adapters → raw. Each layer peels back one level of abstraction.
- **Agent-deterministic.** One way to do each thing. No ambiguity, no alternatives for the same operation.
- **Composable, not monolithic.** Pick the layers you need. Skip what you don't.
- **Design by Contract.** Every public SDK function and method documents its contract via JSDoc — `@expects` for caller assumptions, `@precondition` for conditions enforced at runtime with a throw, `@postcondition` for guaranteed return shape, `@throws` for the error types it can raise. `@precondition` is a hard commitment: the implementation MUST validate the condition and throw on violation. `@expects` is softer — caller responsibility, not enforced. Agents read these contracts to generate correct calls on the first try without trial-and-error; humans read them to reason about behavior without reading the implementation. Note: interface specifications in this document use prose-style contract comments (`// Precondition: ...`) for readability; the corresponding implementation files use the formal JSDoc tags.
- **Pay only for what you import.** `@dappbooster/core` ships with zero runtime dependencies. Adapter packages declare React, wagmi, and connector libraries as **optional** peer dependencies. An agent script importing `@dappbooster/evm-adapter` (root) gets viem and nothing else — no React reconciler, no wagmi connectors, no UI library. Sub-path exports + optional peer deps are the enforcement mechanism.
- **Chain-agnostic at the edge.** Core interfaces (`WalletAdapter`, `TransactionAdapter`, `ChainDescriptor`, `ChainSigner`, `TransactionParams`) use generic types — `unknown` for opaque signers, `string | number` for chainIds, `unknown` for chain-specific payloads. Chain-specific types (`Address`, `Abi`, `WalletClient`, `PublicKey`) appear ONLY inside adapter packages, never in core. This boundary is what makes adding SVM, Cosmos, Sui, Aptos, etc. additive — they implement the same interfaces against their native libraries without touching core.
- **One canonical import path per symbol.** Each exported symbol has exactly one valid import path. Sub-paths are canonical (`@dappbooster/react/hooks`, `@dappbooster/evm-adapter/wagmi`); root barrels are either curated aggregators or empty (`export {}`). No `export *`. This is the enforcement mechanism behind agent-deterministic — without it, agents face N valid paths to the same symbol and decisions become non-deterministic.
- **Errors are typed and discoverable.** Every error the SDK can raise is a named class (`WalletNotConnectedError`, `ChainNotSupportedError`, `AdapterNotFoundError`, `InsufficientFundsError`, `PreStepsNotExecutedError`, `TransactionNotReadyError`, `CapabilityNotSupportedError`, `AmbiguousAdapterError`, etc.) with typed contextual properties. Consumers `try/catch` on the class, not on string parsing. Lifecycle hooks (`onError`) are observers — they never absorb errors. Errors thrown from operations propagate to the caller; errors thrown from observation hooks are swallowed so they never abort the operation. See the [Consumer Error Handling Guide](./adapter-spec/06-use-cases.md#consumer-error-handling-guide) for per-action mapping.

### Escape hatch strategy

The "Layered escape hatches" principle is **progressive disclosure**: common flows take one line; uncommon flows take more. Each layer is a superset of the layer below it — you never lose access to what the lower layer offered, you just opt out of its sugar.

Strategic intent:

- **Happy path is one line.** Agents and first-time consumers ship the 90% case with a single component. Zero research, zero config.
- **Escalation is cheap and reversible.** Moving from Level N to Level N+1 is always a single import change and a few additional lines. You never rewrite from scratch to go deeper, and you can climb back up later.
- **Every level is first-class.** Level 5 (raw adapter factories) is not a workaround or a last resort — it is the intended surface for CLI tools, agent scripts, relayers, and any non-React consumer. Lower levels exist *on top of it*, not *instead of it*. The same code paths run at every level.
- **Agents escalate one level at a time.** "I need to go deeper" comes from a concrete limitation at the current level (e.g., I need to swap the adapter for a custom one, I need to skip provider resolution), never from taste or uncertainty. Agents should never jump from Level 1 to Level 5; they should try Levels 2, 3, 4 in order and stop at the first level that meets the requirement.
- **Lower levels are discoverable from higher ones.** `useTransaction()` exposes `resolveAdapters(chainId)` so consumers at Level 2 can escalate to Level 3 without leaving the hook. The hook exposes the adapters so consumers don't have to re-resolve from the provider context themselves.

See [Provider and Hooks → Escape hatch progression](./adapter-spec/03-provider-and-hooks.md#escape-hatch-progression) for the five concrete levels with import paths.

### Package structure

```
@dappbooster/core     → adapters, interfaces, types, chain registry, utilities
@dappbooster/react    → hooks, provider (React 19+, no styling dependency)
@dappbooster/chakra   → styled components (one of many possible style packages)
```

`@dappbooster/core` is framework-agnostic — usable in Node.js, CLI tools, agent scripts, Vue, Svelte, or any other runtime. `@dappbooster/react` adds React hooks. `@dappbooster/chakra` adds one opinionated styled component set. Other style packages (Tailwind, Shadcn, etc.) wrap the same hooks with different markup.

---

## Spec Navigation

The full spec is split into focused subdocuments for maintainability:

| # | Document | Description |
|---|---|---|
| 1 | [Chain Registry](./adapter-spec/01-chain-registry.md) | `ChainDescriptor`, `ChainRegistry`, explorer URL utilities, address config |
| 2 | [Adapters](./adapter-spec/02-adapters.md) | `WalletAdapter`, `TransactionAdapter`, `ReadClientFactory` interfaces, lifecycle hooks |
| 3 | [Provider and Hooks](./adapter-spec/03-provider-and-hooks.md) | `DAppBoosterProvider`, `useWallet`, `useTransaction`, `useMultiWallet`, `useReadOnly`, `useChainRegistry` |
| 4 | [Components](./adapter-spec/04-components.md) | Style package layer — `TransactionButton`, `SignButton`, `WalletGuard`, `ConnectWalletButton`, `ExplorerLink`, `SwitchChain` |
| 5 | [EVM Adapter](./adapter-spec/05-evm-adapter.md) | `EvmWalletAdapter`, `EvmTransactionAdapter`, connector configs, codegen generalization |
| 6 | [Use Cases](./adapter-spec/06-use-cases.md) | Agent integration, 14 reference use cases, validation, consumer error handling guide |
| 7 | [Migration and Monorepo](./adapter-spec/07-migration-and-monorepo.md) | Phased migration path, monorepo directory structure, chain tier analysis |
| 8 | [Versioning Policy](./adapter-spec/08-versioning.md) | Public surface, semver model, deprecation policy, Changesets workflow |

See also: [Architecture overview](./adapter-architecture-overview.md) for a high-level summary, [CONTRIBUTING.md](../../CONTRIBUTING.md) for external contributor guidance.

---

## Reading Order

**Understanding the architecture (start here):**
1. This index (design principles, package structure)
2. [Chain Registry](./adapter-spec/01-chain-registry.md) — foundational types
3. [Adapters](./adapter-spec/02-adapters.md) — the core interfaces
4. [Provider and Hooks](./adapter-spec/03-provider-and-hooks.md) — how consumers interact

**Implementing a consumer (React dApp, agent script, CLI tool):**
1. [Provider and Hooks](./adapter-spec/03-provider-and-hooks.md) — registration and hook API
2. [Components](./adapter-spec/04-components.md) — styled components (if using a style package)
3. [Use Cases](./adapter-spec/06-use-cases.md) — reference use cases and agent decision tree

**Adding a new chain type:**
1. [Chain Registry](./adapter-spec/01-chain-registry.md) — `ChainDescriptor` fields your chain needs
2. [Adapters](./adapter-spec/02-adapters.md) — `WalletAdapter` and `TransactionAdapter` contracts to implement
3. [EVM Adapter](./adapter-spec/05-evm-adapter.md) — reference implementation to follow

**Understanding the EVM implementation:**
1. [EVM Adapter](./adapter-spec/05-evm-adapter.md) — wagmi/viem wrapping, connector configs, codegen
2. [Adapters](./adapter-spec/02-adapters.md) — the interfaces it implements

**Planning the monorepo extraction:**
1. [Migration and Monorepo](./adapter-spec/07-migration-and-monorepo.md) — phased migration, directory structure, package boundaries
2. [Versioning Policy](./adapter-spec/08-versioning.md) — semver model and Changesets workflow

**Governance (publishing, contributing, planning version bumps):**
1. [Versioning Policy](./adapter-spec/08-versioning.md) — what's stable, what evolves, how deprecations work
2. [CONTRIBUTING.md](../../CONTRIBUTING.md) — external contributor expectations and communication channels

---

## Glossary

| Term | Definition |
|---|---|
| **Adapter** | Implementation of `WalletAdapter` or `TransactionAdapter` for a specific chain type |
| **CAIP-2** | Cross-chain standard identifier format: `namespace:reference` (e.g., `eip155:1`, `solana:5eykt4U...`, `cosmos:cosmoshub-4`) |
| **Chain type** | VM/ecosystem family: `'evm'`, `'svm'`, `'movevm-sui'`, `'movevm-aptos'`, `'cosmos'`, `'starknet'`, `'substrate'`, `'near'`, `'ton'` |
| **Chain descriptor** | Metadata about a specific chain: caip2Id, chainId, name, explorer, endpoints, addressConfig, currency |
| **Chain registry** | Lookup structure mapping chainId/caip2Id → chain descriptor, built from adapters and explicit config |
| **Connector** | EVM-specific wallet UI library (ConnectKit, RainbowKit, Reown). Implements `EvmConnectorConfig` |
| **Transaction phases** | `TransactionAdapter` exposes three methods (`prepare`, `execute`, `confirm`). The hook layer adds two consumer-visible states: `'idle'` (initial) and `'preStep'` (running an intermediate transaction discovered by `prepare`). The `TransactionPhase` enum used by lifecycle hooks is `'prepare'`, `'preStep'`, `'submit'`, `'confirm'`. |
| **Lifecycle hooks** | Observer callbacks at transaction/signing phase transitions. Two scopes: global (provider) and per-operation. Fire-and-forget — errors thrown inside a hook are swallowed and never abort the operation |
| **PreStep** | Prerequisite transaction discovered during `prepare()` (e.g., token approval). Data, not a callback |
| **PreStepStatus** | Per-step lifecycle state used by `useTransaction`: `'pending'`, `'executing'`, `'completed'`, `'failed'`. Drives per-step approval UX |
| **Style package** | UI component library wrapping hooks with a specific styling solution (`@dappbooster/chakra`, future `@dappbooster/tailwind`) |
| **Server wallet** | `WalletAdapter` implementation for backend use — wraps a private key, `connect()`/`disconnect()` are no-ops |
| **Headless** | Logic with no UI dependency. The hooks and core adapters are headless; components are not |
| **WalletAdapterBundle** | What an adapter factory returns — `{ adapter, Provider?, useConnectModal?, readClientFactory? }`. The `Provider` field carries the React provider tree the adapter needs (e.g., `WagmiProvider`); `DAppBoosterProvider` composes all bundle Providers internally |
| **ReadClientFactory** | Generic factory `{ chainType, createClient(endpoint, chainId): TClient }` that produces chain-specific read clients (viem `PublicClient` for EVM, `Connection` for SVM). Auto-contributed by adapter bundles or registered explicitly in `DAppBoosterConfig.readClientFactories` |
| **Bridge component** | Internal React component mounted inside an adapter bundle's `Provider` tree. Captures the connector's `useConnectModal` result and writes it into `DAppBoosterContext.connectModalsRef` so hooks outside the bundle's tree (`useWallet`) can call `openConnectModal()` |
| **CodegenPlugin** | Interface `{ name: string, run(): Promise<CodegenResult> }` that adapter packages export to participate in `pnpm codegen`. Discovered by the orchestrator via local convention (`src/sdk/<adapter>/codegen/index.ts`) or installed-package field (`"dappbooster": { "codegen": "<path>" }`) |
| **wrapAdapter** | Utility from `@dappbooster/core/utils` that wraps every method on an adapter with optional observation hooks (`onBefore`, `onAfter`, `onError`) and transformation hooks (`beforeCall`, `afterCall`). Execution order: `beforeCall → onBefore → method → onAfter → afterCall`. Observation errors are swallowed; transformation errors propagate |
