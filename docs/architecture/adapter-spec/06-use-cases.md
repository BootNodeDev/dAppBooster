# Use Cases, Validation, and Error Handling

> Part of the [dAppBooster adapter architecture spec](../adapter-architecture-spec.md).
> See also: [Adapters](./02-adapters.md), [Provider and Hooks](./03-provider-and-hooks.md), [EVM Adapter](./05-evm-adapter.md)

---

## 9. Agent Integration and Non-Browser Use Cases

### @dappbooster/core as a blockchain runtime

`@dappbooster/core` is framework-agnostic. It runs anywhere JavaScript runs — browser, Node.js, Deno, Bun, edge functions. For EVM, install `@dappbooster/evm-adapter` alongside core (viem-only, no React). This makes it the blockchain interaction layer for:

**AI agent scripts:**

```typescript
import { createEvmTransactionAdapter, createEvmServerWallet } from '@dappbooster/evm-adapter'

const wallet = createEvmServerWallet({ privateKey: process.env.AGENT_PK })
const evm = createEvmTransactionAdapter()

// Same four-phase cycle as frontend
const prepared = await evm.prepare({
  chainId: 1,
  payload: { contract: { abi: usdcAbi, functionName: 'transfer', args: [to, amount] }, to: usdcAddress },
})

const ref = await evm.execute(prepared.params, wallet.getSigner())
const result = await evm.confirm(ref)
```

No React. No browser. No wagmi. Same typed adapters, same lifecycle hooks (for logging/monitoring), same interfaces an agent already knows from building frontends.

**CLI tools:**

```typescript
import { createChainRegistry, getExplorerUrl } from '@dappbooster/core/chain'

const registry = createChainRegistry([...evmChains, solanaMainnet])

// Portfolio check across chains
for (const chain of registry.getAllChains()) {
  const balance = await fetchBalance(chain, address)
  console.log(`${chain.name}: ${balance}`)
  console.log(`  Explorer: ${getExplorerUrl(registry, { chainId: chain.chainId, address })}`)
}
```

**Backend relayers:**

Same adapters with server-side signers. Lifecycle hooks plug into monitoring/alerting. The SDK handles the execute/confirm cycle; the relayer adds nonce management, queuing, and retry logic on top.

### Why this matters

- **Agents learn one SDK.** Building a UI and executing transactions directly use the same interfaces. No context switch.
- **Multi-chain by default.** An agent managing assets across EVM + Solana uses the same adapter pattern everywhere.
- **Deterministic API.** One interface, one way to execute. Agents don't handle ambiguity.
- **Lifecycle hooks for observability.** Agent frameworks plug into `onSubmit`, `onConfirm`, `onError` for decision logging, cost tracking, and alerting.

### Three consumers, one core

```
@dappbooster/core (adapters, interfaces, types)
  ├── @dappbooster/react (hooks) → @dappbooster/chakra (styled components)
  ├── Agent scripts (Node.js, direct adapter usage)
  └── CLI tools (terminal, direct adapter usage)
```

### Documentation strategy for agents

Three layers, each optimized for a different context window:

**Layer 1: `llms.txt`**

Machine-optimized context file at the package root. Agents load this first. Contains:

- Package map: what each package provides
- Decision tree: intent → API mapping (no ambiguity, no alternatives)
- Canonical examples: one per use case, copy-paste ready
- Escape hatch progression: which level of abstraction to use when

Structure:

```
# @dappbooster SDK — Agent Context

## Package map
@dappbooster/core → adapters, types, chain registry (no framework dependency)
@dappbooster/react → hooks, provider (React 19+)
@dappbooster/chakra → styled components (Chakra UI 3)

## Decision tree

### Execute a transaction
- React + styled → <TransactionButton chainId={X} params={Y} />
- React + custom UI → useTransaction({ chainId, params })
- Node.js / CLI / agent → TransactionAdapter.execute(params, signer)

### Connect a wallet
- React + styled → <ConnectWalletButton />
- React + custom UI → useWallet({ chainId }).connect()
- Node.js (server wallet) → createEvmServerWallet({ privateKey })

### Read on-chain data without a wallet
- React → useReadOnly({ chainId, address })
- Node.js → create public client from adapter

### Get an explorer URL
- Any environment → getExplorerUrl(registry, { chainId, tx | address | block })

### Add a new chain type
- Implement WalletAdapter<'mychain'> + TransactionAdapter<'mychain'>
- Register in DAppBoosterProvider or use directly

## Canonical examples
[One complete example per use case — no "you could also" alternatives]
```

**Layer 2: TypeDoc JSDoc on every export**

One-line purpose, `@example` block, `@see` cross-references:

```typescript
/**
 * Execute a transaction on any supported chain.
 *
 * @example
 * ```tsx
 * const tx = useTransaction({ chainId: 1, params: { payload: { to, data, value } } })
 * await tx.execute()
 * ```
 *
 * @see useWallet - for wallet connection state
 * @see TransactionAdapter - for the underlying adapter interface
 */
function useTransaction(options: UseTransactionOptions): UseTransactionReturn
```

**Layer 3: Reference use cases**

Complete working examples (see below).

---

## 10. Reference Use Cases

Each use case demonstrates a different composition of SDK primitives. These are runnable reference apps — not snippets, but complete starting points.

### Use case matrix

| # | Use case | Wallet adapters | Transaction adapters | Packages | Key pattern | Status |
|---|---|---|---|---|---|---|
| 1 | **EVM dApp** (Aave-like) | EVM | EVM | core + evm-adapter + react + chakra | Single-chain, generated hooks, TransactionButton | **Ready** — use `createEvmWalletAdapter` + `createEvmTransactionAdapter`, `<TransactionButton params={...}>` |
| 2 | **Auth-only app** (portal-earn-like) | EVM + SVM + Sui + Aptos | None | core + evm-adapter + react | Multi-platform wallet signing, no transactions | **EVM only** — use `useWallet({ chainType: 'evm' })` + `signMessage()`. SVM/Sui/Aptos adapters are future work. |
| 3 | **Portfolio tracker** (Rotki-like) | None | None | core + evm-adapter + react | Read-only, arbitrary addresses, data fetching | **Ready** — `useReadOnly({ chainId, address })` returns client, chain, address, and explorerAddressUrl. Use `useChainRegistry()` for chain metadata. |
| 4 | **Cross-chain bridge** | EVM + SVM | EVM + SVM | core + evm-adapter + react | Multi-adapter, consumer-land flow orchestrator | **EVM-side only** — compose two `useWallet()` calls + two `useTransaction()` calls. `WalletGuard` supports multi-chain via `require: WalletRequirement[]`. SVM adapter is future work. |
| 5 | **Custom-styled dApp** (Tailwind) | EVM | EVM | core + evm-adapter + react (no chakra) | Hooks-only, custom components, headless pattern | **Ready** — import hooks from `@dappbooster/react/hooks` sub-paths. Build your own components with any CSS framework. |
| 6 | **Agent script** | Server wallet | EVM | core + evm-adapter (viem only, no React) | Node.js, server-side signer, lifecycle logging, no React | **Ready** — `createEvmServerWallet({ privateKey, chain })` + `createEvmTransactionAdapter(config)`. Call `adapter.execute(params, signer)` directly. |
| 7 | **CLI tool** | Server wallets | Multi-chain | core + evm-adapter (viem only, no React) | Terminal UX, multi-chain commands, batch operations | **EVM only** — use `createEvmServerWallet` + `createChainRegistry(chains)` + `getExplorerUrl()`. Multi-chain requires future adapters. |
| 8 | **Relayer** | Server wallets | Multi-chain | core + evm-adapter (viem only, no React) | Backend service, lifecycle hooks for monitoring | **EVM only** — same as use case 6 with `wrapAdapter()` for logging/monitoring or transformation. Consumer adds nonce management. |
| 9 | **Smart wallet (AA)** | ERC-4337 adapter | Bundler-based adapter | core + react | UserOperations, paymaster, batched calls | **Not started** — requires custom `WalletAdapter` + `TransactionAdapter` implementations. Interfaces support it; no reference adapter ships. |
| 10 | **Gasless app** | EVM (sign only) | Server-side relay | core + evm-adapter (client + server) | Client signs permit, server submits and pays gas | **Primitives ready** — client: `useWallet().signTypedData()` for permit. Server: `createEvmServerWallet()` + `createEvmTransactionAdapter()`. Consumer composes the relay logic. |
| 11 | **Multi-sig** (Safe-like) | EVM | EVM (propose/approve) | core + evm-adapter + react | Multi-party transaction lifecycle, EIP-712 typed data signing | **Primitives ready** — `useWallet().signTypedData()` for EIP-712. Consumer implements propose/approve/execute flow; SDK provides signing + lifecycle hooks. |
| 12 | **Token-gated app** | EVM (identity only) | None | core + evm-adapter + react | Connect wallet, verify ownership, no transactions | **Ready** — `useWallet({ chainId })` for connection + address. `WalletGuard` gates UI. Consumer verifies token ownership off-chain or via `useReadOnly`. |
| 13 | **ZK identity / voting** | EVM | EVM (proof as calldata) | core + evm-adapter + react | Proof generation as PreStep, lifecycle hooks for progress | **Ready** — `createApprovalPreStep` pattern works for proof-as-preStep. `autoPreSteps: true` runs automatically, or use manual `executePreStep(index)` / `executeAllPreSteps()` from `useTransaction()` for step-by-step approval UI. |
| 14 | **FHE private DeFi** | EVM + encryption keys | EVM (encrypted payload) | core + evm-adapter + react | Encrypt/decrypt middleware on adapters | **Ready** — `wrapAdapter()` supports transforming hooks (`beforeCall` to encrypt args, `afterCall` to decrypt results) alongside observation hooks (`onBefore`, `onAfter`, `onError`). |

### What each validates

- **Use cases 1, 5**: Basic single-chain dApp works with minimal config
- **Use cases 2, 12**: Wallet-only apps (no transaction adapter) are first-class
- **Use case 3**: Zero-adapter apps (read-only) are first-class
- **Use cases 4, 10**: Multi-chain apps compose adapters independently
- **Use cases 6, 7, 8**: Non-browser use cases work with `@dappbooster/core` + `@dappbooster/evm-adapter` (viem-only, no React)
- **Use case 9**: Adapter interfaces accommodate non-standard transaction models (UserOps, bundlers)
- **Use case 11**: Lifecycle hooks support multi-party flows
- **Use cases 13, 14**: Pre-processing (ZK proofs, FHE encryption) composes with standard adapters via PreStep and middleware

### Agent implementation guide

When an agent needs to implement one of these use cases, follow this decision tree:

1. **Does the app need a wallet connection?** Yes → register wallet adapters in `DAppBoosterConfig.wallets`. No → skip wallets, use `chains` + `readClientFactories` for read-only.
2. **Does the app send transactions?** Yes → register transaction adapters in `DAppBoosterConfig.transactions`. No → skip transactions.
3. **Is this a React app?** Yes → use `DAppBoosterProvider` + hooks (`useWallet`, `useTransaction`). No → use the adapter factories directly (`@dappbooster/evm-adapter` for EVM, analogous packages for other chains — no provider).
4. **Which chain types?** EVM is the only shipped adapter. For other chains, implement `WalletAdapter` and/or `TransactionAdapter` against the interfaces.
5. **Which EVM connector?** Pass one of `connectkitConnector`, `rainbowkitConnector`, or `reownConnector` to `createEvmWalletAdapter({ connector })`. This is a one-line config choice.

**Resolution rules (deterministic — no alternatives):**
- Always resolve adapters by `chainId` (preferred) or `chainType`. Never omit both in multi-adapter setups.
- Always pass `chainId` or `chainType` to `<TransactionButton>`, `<SignButton>`, `<WalletGuard>`.
- Always import SDK hooks from `@dappbooster/react` (or `src/sdk/react/hooks`). Never use deprecated hooks from `src/hooks/` or `src/wallet/hooks/`.
- Always use `createEvmWalletAdapter` to get a `WalletAdapterBundle`. Never construct wagmi config separately.
- For server-side / agent scripts, use `createEvmServerWallet` + `createEvmTransactionAdapter`. Never import React hooks.

**wagmi config sharing rule (critical — single config instance):**

The app must use exactly ONE wagmi `Config` instance at runtime. Generated contract hooks (from `pnpm wagmi-generate`) and the SDK wallet adapter must reference the same config, otherwise generated hooks read from a disconnected client and target the wrong chain.

The config lives at `src/wallet/connectors/wagmi.config.ts`:
```typescript
import { chains, transports } from '@/src/core/types'
import { createRainbowkitConnector } from '@/src/sdk/evm-adapter/react/connectors'  // or connectkit, reown
export const config = rainbowkitConnector.createConfig([...chains], transports)
```

Two places reference this:
1. **`src/routes/__root.tsx`** — passes it as `wagmiConfig` to `createEvmWalletAdapter({ ..., wagmiConfig })`
2. **`src/contracts/wagmi/plugins/reactSuspenseRead.ts`** — the `walletConfigImport` string on line 9 controls what the generated hooks import

**When switching connectors:** change the connector import in `wagmi.config.ts` and in `__root.tsx`. Both files must use the same connector. The codegen plugin path does NOT need to change — it always points to `wagmi.config.ts`.

### Use case details

Each reference app should include:

1. **Provider configuration** — the exact `DAppBoosterConfig` for this use case
2. **Key component** — the primary UI component showing hook usage
3. **Adapter composition** — which adapters are registered and why
4. **What's SDK vs what's consumer code** — clear boundary

These reference apps also serve as templates for `create-dappbooster`:

```bash
npx create-dappbooster --template evm-defi
npx create-dappbooster --template bridge
npx create-dappbooster --template portfolio-tracker
npx create-dappbooster --template agent-script
```

---

## 11. Validation

### TransactionFlow orchestrator (consumer-land)

The SDK doesn't ship a flow orchestrator. This section proves the primitives support one.

A bridge app sequences: approve → lock → wait for relay → claim across two chains:

```typescript
// Consumer code — NOT part of the SDK

interface FlowStep {
  label: string
  chainId: string | number
  params: TransactionParams
  resolveDependencies?: (previousResults: TransactionResult[]) => TransactionParams
}

function useTransactionFlow(steps: FlowStep[]) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<TransactionResult[]>([])
  const [phase, setPhase] = useState<'idle' | 'running' | 'complete' | 'error'>('idle')
  const registry = useChainRegistry()

  async function run() {
    setPhase('running')

    for (let i = 0; i < steps.length; i++) {
      setCurrentIndex(i)
      const step = steps[i]

      const params = step.resolveDependencies
        ? step.resolveDependencies(results)
        : step.params

      const chainType = registry.getChainType(step.chainId)
      const txAdapter = getTransactionAdapter(chainType)
      const walletAdapter = getWalletAdapter(chainType)

      const prepared = await txAdapter.prepare(params)

      // Handle pre-steps (approvals)
      if (prepared.preSteps) {
        for (const preStep of prepared.preSteps) {
          const preRef = await txAdapter.execute(preStep.params, walletAdapter.getSigner())
          await txAdapter.confirm(preRef)
        }
      }

      const ref = await txAdapter.execute(params, walletAdapter.getSigner())
      const result = await txAdapter.confirm(ref)

      if (result.status !== 'success') {
        setPhase('error')
        return
      }

      setResults(prev => [...prev, result])
    }

    setPhase('complete')
  }

  return { run, currentIndex, results, phase, totalSteps: steps.length }
}
```

Bridge usage:

```tsx
const bridge = useTransactionFlow([
  {
    label: 'Approve USDC',
    chainId: 1,
    params: { chainId: 1, payload: { contract: approveConfig } },
  },
  {
    label: 'Lock tokens on Ethereum',
    chainId: 1,
    params: { chainId: 1, payload: { contract: lockConfig } },
  },
  {
    label: 'Claim on Solana',
    chainId: 'solana-mainnet',
    resolveDependencies: (results) => ({
      chainId: 'solana-mainnet',
      payload: { instruction: buildClaimInstruction(results[1].receipt) },
    }),
  },
])
```

### What the SDK provides vs what the consumer builds

| Concern | SDK | Consumer |
|---|---|---|
| Adapter resolution by chainId | `DAppBoosterProvider` + `ChainRegistry` | — |
| Transaction execution (4 phases) | `TransactionAdapter` | — |
| Approval detection | `PrepareResult.preSteps` | — |
| Lifecycle notifications | Global hooks in provider | — |
| Explorer URLs | `ChainRegistry` + `getExplorerUrl` | — |
| Step sequencing | — | Flow orchestrator |
| Cross-step dependencies | — | `resolveDependencies` |
| Relay/attestation waiting | — | Custom polling step |
| Multi-chain wallet prompts | — | Progressive connect UX |
| Flow progress UI | — | Progress indicators |

### Hard use case validation

**Account Abstraction (ERC-4337):**

- `SmartWalletAdapter` implements `WalletAdapter<'evm-aa'>`. `connect()` initializes smart account. `getSigner()` returns session key or owner signer. `getStatus()` tracks smart account address.
- `BundlerTransactionAdapter` implements `TransactionAdapter<'evm-aa'>`. `execute()` builds UserOperation, sends to bundler. `confirm()` watches for UserOp inclusion.
- `prepare()` returns paymaster willingness (sponsored gas) in `estimatedFee`.
- `PreStep` for "deploy smart account" if it doesn't exist yet.
- `TransactionRef.id` is UserOp hash. `ChainSigner` is session key. Interfaces hold.

**Gasless / Meta-transactions:**

- Client: `WalletAdapter.signMessage()` or `signTypedData()` for permits.
- Server: `TransactionAdapter.execute()` with `ServerWalletAdapter`. Relayer submits tx with user's signature in calldata.
- Split: client uses `@dappbooster/react`, server uses `@dappbooster/core`. Same interfaces, different runtimes.
- Lifecycle hooks on server notify client via websocket (consumer-land).

**FHE Private DeFi:**

- `WalletAdapter` extended with `getEncryptionKey()` on an FHE-specific adapter.
- Encryption middleware wraps `TransactionAdapter`: encrypts payload before `execute()`, decrypts receipt after `confirm()`.
- `prepare()` validates contract supports encrypted inputs.
- `useReadOnly` with decryption middleware for reading encrypted state.
- Interfaces hold — encryption is middleware, not a new adapter type.

### Architecture risks and mitigations

| Risk | Mitigation |
|---|---|
| `ChainSigner` as `unknown` loses type safety | Concrete adapters expose typed signers (`EvmSigner`, `SvmSigner`). Generic interface stays stable. |
| `payload` as `unknown` allows wrong structure | Each adapter factory documents its payload type. `llms.txt` includes per-chain examples. TypeDoc `@example` shows exact shapes. |
| Lifecycle hook ordering confusion | Documented contract: global fires first, per-operation second. Both always fire. Errors in hooks never abort transactions. |
| Migration from current codebase is large | EVM adapter wraps existing wagmi code — internals don't change. Old and new components coexist during migration. |
| Adapter interface too rigid for unknown future chains | Four-phase cycle is universal. Irrelevant phases return no-ops. Metadata is extensible via `Record<string, unknown>`. |
| Two adapters to register (wallet + transaction) feels like boilerplate | Factory functions compose both: `createEvmAdapters({ ... })` returns `{ wallet, transaction }`. Single-line setup for common cases. |

---

## Consumer Error Handling Guide

This section maps every user-facing action to the exact SDK errors it can produce, documents whether the hook handles those errors internally or propagates them, and clarifies the two distinct error handling patterns consumers encounter.

### Per-action error table

Each row lists a user action, the SDK error classes that can be thrown, and how the hook layer handles them. "Propagates" means the consumer must `try/catch`. "Catches + re-throws" means the hook sets its `error` state AND re-throws — the consumer can read `error` reactively or `try/catch` the async call.

| User Action | Possible Errors | Hook Behavior |
|---|---|---|
| Connect wallet | `WalletNotInstalledError`, `WalletConnectionRejectedError`, `ChainNotSupportedError` | `useWallet().connect()` propagates — consumer must try/catch |
| Disconnect wallet | _(none — no-op if already disconnected)_ | `useWallet().disconnect()` propagates (but does not throw in practice) |
| Sign message | `WalletNotConnectedError`, `SigningRejectedError` | `useWallet().signMessage()` propagates — consumer must try/catch |
| Sign typed data | `WalletNotConnectedError`, `SigningRejectedError`, `CapabilityNotSupportedError` | `useWallet().signTypedData()` propagates — consumer must try/catch. `CapabilityNotSupportedError` is thrown synchronously if the adapter does not support the capability. |
| Switch chain | `WalletNotConnectedError`, `ChainNotSupportedError` | `useWallet().switchChain()` propagates — consumer must try/catch |
| Execute transaction | `AdapterNotFoundError`, `WalletNotConnectedError`, `TransactionNotReadyError`, `PreStepsNotExecutedError`, `InsufficientFundsError`, `InvalidSignerError`, `ChainNotSupportedError` | `useTransaction().execute()` catches all, sets `error` state, fires `lifecycle.onError`, AND re-throws |
| Prepare transaction | `AdapterNotFoundError`, `TransactionNotReadyError`, `InsufficientFundsError` | `useTransaction().prepare()` catches all, sets `error` state AND re-throws |
| Execute single pre-step | `Error` (prepare not called), `RangeError` (index out of bounds), `AdapterNotFoundError`, `WalletNotConnectedError` | `useTransaction().executePreStep()` — precondition errors (`Error`, `RangeError`, `AdapterNotFoundError`, `WalletNotConnectedError`) propagate directly without setting `error` state. Execution errors (from adapter `execute`/`confirm`) are caught, set `error` state, and re-thrown. |
| Execute all pre-steps | Same as single pre-step (delegates to `executePreStep`) | `useTransaction().executeAllPreSteps()` — errors propagate from `executePreStep` |
| Resolve wallet adapter | `AdapterNotFoundError`, `AmbiguousAdapterError` | `useWallet()` throws synchronously during render — React error boundary catches |
| Provider initialization | `ChainRegistryConflictError`, `Error` (chainType mismatch) | `DAppBoosterProvider` throws synchronously during render — React error boundary catches |

### Error semantics: `ChainNotSupportedError` vs `AdapterNotFoundError`

Both errors mean "this chain doesn't work" to a consumer, but they occur at different levels:

- **`AdapterNotFoundError`** — thrown by the hook resolution layer. No registered adapter's `supportedChains` includes the requested `chainId`. This means the SDK has no adapter at all for this chain.
  - **Throw sites:** `useWallet()` (via `resolveAdapter()`), `useTransaction().execute()`, `useTransaction().prepare()`, `useTransaction().executePreStep()`

- **`ChainNotSupportedError`** — thrown by the adapter itself. An adapter was found but its own validation rejects the `chainId`. This occurs inside adapter methods like `connect()`, `switchChain()`, and `execute()`.
  - **Throw sites:** `WalletAdapter.connect()` (when `options.chainId` is not in `supportedChains`), `WalletAdapter.switchChain()`, `TransactionAdapter.execute()`

In practice, `AdapterNotFoundError` fires first (during resolution) if no adapter matches. `ChainNotSupportedError` fires later (during execution) if the adapter was resolved via a different chain but the target chain is not supported.

### Error semantics: `InvalidSignerError`

`InvalidSignerError` is an internal safety check at the adapter boundary. The `TransactionAdapter.execute()` method validates that the signer it receives is the correct type (e.g., a viem `WalletClient` for EVM). This guards against passing an SVM signer to an EVM adapter. Consumers should not normally encounter this error — it indicates a misconfigured adapter stack, not a user action failure.

### Hook error handling patterns

The SDK uses two distinct patterns for error handling at the hook layer:

#### Pattern 1: `useWallet` methods — raw passthrough

All `useWallet()` methods (`connect`, `disconnect`, `signMessage`, `signTypedData`, `switchChain`, `getSigner`) delegate directly to the adapter. Errors propagate unmodified to the consumer. There is no `error` state on the return object.

```ts
const { connect, signMessage } = useWallet({ chainType: 'evm' })

try {
  await connect()
} catch (err) {
  if (err instanceof WalletConnectionRejectedError) {
    // User cancelled — show a dismissable message
  }
  if (err instanceof WalletNotInstalledError) {
    // Wallet not found — show install instructions
  }
}

try {
  const result = await signMessage({ message: 'Hello' })
} catch (err) {
  if (err instanceof SigningRejectedError) {
    // User cancelled signing
  }
}
```

The `signMessage` and `signTypedData` wrappers fire `walletLifecycle.onSignError` before re-throwing, but the error still propagates to the consumer.

#### Pattern 2: `useTransaction` methods — catch, set state, re-throw

All `useTransaction()` async methods (`execute`, `prepare`, `executePreStep`, `executeAllPreSteps`) catch errors, set the `error` property on the hook return, and re-throw. Consumers can handle errors in two ways:

**Reactive (read `error` state):**

```ts
const { execute, error, phase } = useTransaction()

// In a click handler:
execute(params).catch(() => {})  // swallow — read error reactively

// In JSX:
{error && <ErrorBanner message={error.message} />}
```

**Imperative (try/catch):**

```ts
const { execute } = useTransaction()

try {
  const result = await execute(params)
  // success
} catch (err) {
  if (err instanceof TransactionNotReadyError) {
    // preparation failed
  }
  if (err instanceof PreStepsNotExecutedError) {
    // manual pre-steps not completed
  }
}
```

**Important nuance for `executePreStep`:** Precondition checks (prepare not called, index out of bounds, adapter not found, wallet not connected) throw directly without setting `error` state. Only errors during the actual on-chain execution (adapter `execute`/`confirm` calls) go through the catch-set-rethrow pattern. This means the reactive `error` state only captures execution failures, not programmer errors.
