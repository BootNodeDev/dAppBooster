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

See also: [Architecture overview](./adapter-architecture-overview.md) for a high-level summary.

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
| **Four-phase cycle** | prepare → submit → confirm. Universal transaction lifecycle across all chains. `TransactionPhase` type: `'prepare' | 'preStep' | 'submit' | 'confirm'` |
| **Lifecycle hooks** | Observer callbacks at transaction/signing phase transitions. Two scopes: global (provider) and per-operation |
| **PreStep** | Prerequisite transaction discovered during `prepare()` (e.g., token approval). Data, not a callback |
| **Style package** | UI component library wrapping hooks with a specific styling solution (`@dappbooster/chakra`, future `@dappbooster/tailwind`) |
| **Server wallet** | `WalletAdapter` implementation for backend use — wraps a private key, `connect()`/`disconnect()` are no-ops |
| **Headless** | Logic with no UI dependency. The hooks and core adapters are headless; components are not |
