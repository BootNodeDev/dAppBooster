# Provider Architecture and Hook Layer

> Part of the [dAppBooster adapter architecture spec](../adapter-architecture-spec.md).
> See also: [Adapters](./02-adapters.md), [Components](./04-components.md), [EVM Adapter](./05-evm-adapter.md)

---

## 4. Provider Architecture

The provider holds the adapter registry, builds the chain resolution map, and exposes context to hooks. It's the single configuration point — the architect sets it up, developers and agents consume it through hooks.

### DAppBoosterConfig

```typescript
interface DAppBoosterConfig {
  // Wallet adapter bundles, keyed by chain type.
  // Each bundle includes the adapter AND any required React providers (e.g., WagmiProvider).
  wallets?: Record<string, WalletAdapterBundle>

  // Transaction adapters, keyed by chain type (optional)
  transactions?: Record<string, TransactionAdapter>

  // Additional chain descriptors (for read-only use cases with no adapters)
  chains?: ChainDescriptor[]

  // Read client factories (only needed for read-only use cases with no adapters)
  readClientFactories?: ReadClientFactory[]

  // Global lifecycle hooks
  lifecycle?: TransactionLifecycle
  walletLifecycle?: WalletLifecycle
}

// Adapter factories return bundles — the adapter plus any React infrastructure it needs.
// DAppBoosterProvider composes the Provider components from all bundles internally.
interface WalletAdapterBundle {
  adapter: WalletAdapter
  // React provider required by this adapter (e.g., WagmiProvider + QueryClientProvider + ConnectKitProvider).
  // Omit for non-React adapters (server wallets, CLI).
  Provider?: FC<{ children: ReactNode }>
  // Hook to open the connector's connect/account modal.
  // Called via a bridge component inside the bundle's Provider tree.
  // The resulting `open` function is stored per adapter key in the context ref.
  useConnectModal?: () => { open: () => void }
}
```

The `WalletAdapterBundle` solves the React provider wrapping problem: EVM adapters need WagmiProvider, QueryClientProvider, and ConnectKitProvider in the React tree. The adapter factory returns these as a composed `Provider` component. `DAppBoosterProvider` nests all bundle Providers internally — the consumer sees one provider.

```typescript
// createEvmWalletAdapter returns a bundle
const evmBundle = createEvmWalletAdapter({
  chains: [mainnet, optimism],
  connector: connectkitConnector,
})
// evmBundle.adapter → WalletAdapter methods
// evmBundle.Provider → WagmiProvider + QueryClientProvider + ConnectKitProvider (composed)

// Server wallets have no Provider
const serverBundle = createEvmServerWallet({ privateKey })
// serverBundle.adapter → WalletAdapter methods
// serverBundle.Provider → undefined
```
```

### Chain resolution

The provider builds a `ChainRegistry` automatically from three sources, merged in this order:

1. `config.chains` — explicit chain descriptors (read-only use cases)
2. `config.wallets[*].supportedChains` — chains from wallet adapters
3. `config.transactions[*].supportedChains` — chains from transaction adapters

Duplicate chainIds across sources are allowed **only if they resolve to the same chainType**. If two adapters claim the same chainId with different chainTypes, the provider throws at initialization.

### Registration examples

**Minimal EVM dApp:**

```tsx
import { createEvmTransactionAdapter } from '@dappbooster/evm-adapter'
import { createEvmWalletAdapter } from '@dappbooster/evm-adapter/wagmi'
import { connectkitConnector } from '@dappbooster/evm-adapter/react/connectors'
import { DAppBoosterProvider } from '@dappbooster/react'
import { mainnet, optimism } from 'viem/chains'

<DAppBoosterProvider config={{
  wallets: { evm: createEvmWalletAdapter({ chains: [mainnet, optimism], connector: connectkitConnector }) },
  transactions: { evm: createEvmTransactionAdapter() },
  lifecycle: notificationLifecycle,
}}>
  <App />
</DAppBoosterProvider>
```

**Multi-chain bridge:**

```tsx
<DAppBoosterProvider config={{
  wallets: {
    evm: createEvmWalletAdapter({ chains: [mainnet, arbitrum], connector: connectkit }),
    svm: createSvmWalletAdapter({ chains: [solanaMainnet] }),
  },
  transactions: {
    evm: createEvmTransactionAdapter(),
    svm: createSvmTransactionAdapter(),
  },
  lifecycle: notificationLifecycle,
}}>
```

**Auth-only (portal-earn pattern):**

```tsx
<DAppBoosterProvider config={{
  wallets: {
    evm: createEvmWalletAdapter({ chains: [mainnet], connector: connectkit }),
    svm: createSvmWalletAdapter({ chains: [solanaMainnet] }),
    sui: createSuiWalletAdapter({ chains: [suiMainnet] }),
    aptos: createAptosWalletAdapter({ chains: [aptosMainnet] }),
  },
  walletLifecycle: signingNotifications,
  // No transactions — signing only
}}>
```

**Read-only portfolio tracker (no adapters):**

```tsx
import { mainnet, optimism, arbitrum } from 'viem/chains'
import { fromViemChain } from '@dappbooster/evm-adapter'

const evmChains = [mainnet, optimism, arbitrum].map(fromViemChain)

<DAppBoosterProvider config={{
  chains: [...evmChains, solanaMainnet, cosmosHub],
  // No wallets, no transactions — just chain metadata for explorer links and data fetching
}}>
```

### What the provider does internally

1. Merges chain descriptors from all sources into a `ChainRegistry`
2. Validates no chainId conflicts across different chain types
3. Stores adapter references in React context
4. Subscribes to `onStatusChange` for each wallet adapter, syncs to React state
5. Exposes resolution functions to hooks: `getWalletAdapter(chainType)`, `getTransactionAdapter(chainType)`, `getChainRegistry()`

### What the provider replaces

| Current | Becomes |
|---|---|
| `Web3Provider` (WagmiProvider + QueryClient + WalletProvider) | `DAppBoosterProvider` — wallet adapter wraps wagmi internally |
| `TransactionNotificationProvider` | Global lifecycle hooks in provider config |
| `ConnectWalletButton` re-export from Web3Provider | Wallet adapter's connect method + style package component |
| Hardcoded connectkit import in Web3Provider | Connector config passed to adapter factory |

Current provider stack in `__root.tsx`:

```
ChakraProvider → Web3Provider → TransactionNotificationProvider → App
```

Becomes:

```
ChakraProvider → DAppBoosterProvider → App
```

Chakra stays outside — theming is a template concern. `DAppBoosterProvider` is pure context, renders no UI.

---

## 5. Hook Layer

Hooks are the primary consumer API in React apps. They resolve adapters from provider context, manage React state, and expose escape hatches for full control.

### useWallet

Replaces `useWeb3Status` + `useWalletStatus` with chain-type-aware resolution.

```typescript
function useWallet(options?: UseWalletOptions): UseWalletReturn

type UseWalletOptions =
  | { chainId: string | number }
  | { chainType: string }
  | { adapter: WalletAdapter }  // explicit — bypass provider
```

**Default behavior when no options provided:**
- If exactly one wallet adapter is registered → uses that adapter (single-chain app convenience)
- If multiple wallet adapters are registered → **throws `AmbiguousAdapterError`** with a message listing the available chain types and instructing the consumer to specify one

This is deterministic: single-adapter apps work without options, multi-adapter apps must be explicit. An agent always knows which code path it's on.

```typescript
interface UseWalletReturn {
  // State (reactive — triggers re-render on change)
  status: WalletStatus
  isReady: boolean             // connected && targetChainId in connectedChainIds
  needsConnect: boolean        // !connected && !connecting
  needsChainSwitch: boolean    // connected but targetChainId not in connectedChainIds

  // Actions (signMessage/signTypedData fire walletLifecycle hooks from provider)
  connect(options?: ConnectOptions): Promise<WalletConnection>
  disconnect(): Promise<void>
  signMessage(input: SignMessageInput): Promise<SignatureResult>
  signTypedData?(input: SignTypedDataInput): Promise<SignatureResult>  // undefined if capability not supported; throws CapabilityNotSupportedError if called via signTypedDataImpl
  getSigner(): Promise<ChainSigner | null>
  switchChain(chainId: string | number): Promise<void>

  // Modal
  openConnectModal(): void     // opens the correct connector's modal for this adapter (no-op if none registered)

  // Resolution info
  adapterKey: string | null    // the key under which this adapter was registered in DAppBoosterConfig.wallets

  // Escape hatch — raw adapter (access reconnect(), metadata, etc.)
  adapter: WalletAdapter
}
```

Resolution: `{ chainId }` → provider resolves chainType via `ChainRegistry` → looks up wallet adapter. `{ chainType }` → direct lookup. `{ adapter }` → uses adapter directly, no provider. When no adapter matches the requested chain, throws `AdapterNotFoundError` (not `AmbiguousAdapterError`).

### useTransaction

Replaces the inline wagmi calls inside TransactionButton.

```typescript
function useTransaction(options?: UseTransactionOptions): UseTransactionReturn

interface UseTransactionOptions {
  lifecycle?: TransactionLifecycle  // per-transaction hooks
  autoPreSteps?: boolean           // default: true — auto-execute preSteps before main tx
  confirmOptions?: ConfirmOptions  // forwarded to adapter.confirm()
}
```

**`params` are passed to `execute()` at call time, not at hook init.** This means one `useTransaction()` instance can be reused for different transactions. The hook manages phase/state/lifecycle; the params drive each execution.

**`chainId` lives in `params` only — no duplication.** The `execute(params)` call resolves the adapter from `params.chainId`. One source of truth, zero ambiguity. If no adapter supports `params.chainId`, throws `AdapterNotFoundError`.

```typescript
type TransactionExecutionPhase = 'idle' | 'prepare' | 'preStep' | 'submit' | 'confirm'

interface UseTransactionReturn {
  // State (reactive)
  phase: TransactionExecutionPhase
  prepareResult: PrepareResult | null
  ref: TransactionRef | null
  result: TransactionResult | null
  preStepResults: TransactionResult[]
  error: Error | null

  // Metadata
  explorerUrl: string | null  // resolved from ChainRegistry using ref.id

  // Main execution — runs the full cycle: prepare → preSteps → submit → confirm
  //   Precondition: if autoPreSteps === false and preSteps exist → throws PreStepsNotExecutedError
  execute(params: TransactionParams): Promise<TransactionResult>

  // Reset all state back to idle
  reset(): void
}
```

**PreStep execution.** When `autoPreSteps: true` (default), `execute()` runs all preSteps sequentially before the main transaction. When `autoPreSteps: false`, `execute()` throws `PreStepsNotExecutedError` if preSteps exist.

> **Phase 3:** Manual pre-step control — `executePreStep(index)`, `executeAllPreSteps()`, and standalone `prepare()` — to support per-step approval UX (show each approval, let user confirm). Not yet implemented.

Internal flow of `execute(params)`:

1. Resolves `TransactionAdapter` from provider via `params.chainId` — throws `AdapterNotFoundError` if not found
2. Resolves `WalletAdapter` for the same chain — throws `AdapterNotFoundError` if not found
3. Gets signer via `walletAdapter.getSigner()` — throws `WalletNotConnectedError` if null
4. Calls `adapter.prepare(params)` → fires `lifecycle.onPrepare`
5. If `autoPreSteps === true` and preSteps exist → executes each through full cycle, fires `lifecycle.onPreStep` / `lifecycle.onPreStepComplete`
6. If `autoPreSteps === false` and preSteps exist → throws `PreStepsNotExecutedError`
7. Calls `adapter.execute(params, signer)` → fires `lifecycle.onSubmit`
8. Calls `adapter.confirm(ref, confirmOptions)` → fires `lifecycle.onConfirm`
9. On error at any phase → fires `lifecycle.onError` with phase identifier
10. All lifecycle hooks: global (from provider) fires first, per-transaction (from options) fires second. Hook errors are logged but never abort the transaction.

### useMultiWallet

For apps needing multiple simultaneous connections (bridge, portfolio).

```typescript
function useMultiWallet(): UseMultiWalletReturn

// Returns a Record<string, UseWalletReturn> keyed by adapter name from DAppBoosterConfig.wallets.
// Each entry includes wallet lifecycle hook dispatch (signMessage/signTypedData fire walletLifecycle)
// and openConnectModal resolved to the correct adapter.
type UseMultiWalletReturn = Record<string, UseWalletReturn>
```

> **Phase 3:** Convenience methods — `getWallet(chainType)`, `getWalletByChainId(chainId)`, and aggregated `connectedAddresses` summary. Currently consumers iterate the record directly.

### useReadOnly

For data fetching without wallet connection — arbitrary addresses, no signing.

```typescript
function useReadOnly(options: UseReadOnlyOptions): UseReadOnlyReturn

interface UseReadOnlyOptions {
  chainId: string | number
}

interface UseReadOnlyReturn {
  chain: ChainDescriptor | null
  client: unknown  // chain-specific read client (e.g. viem PublicClient for EVM)
}
```

Creating a public client requires knowing the chain type (EVM uses viem's `createPublicClient`, SVM uses `@solana/web3.js Connection`). The hook resolves this through a `ReadClientFactory` — a lightweight registry of "given a chain type + endpoint, create a read client."

```typescript
interface ReadClientFactory {
  readonly chainType: string
  createClient(endpoint: EndpointConfig, chainId: string | number): unknown
}
```

The SDK ships `evmReadClientFactory` (wraps viem). Other factories ship with their adapter packages. Factories are registered in the provider config:

```typescript
<DAppBoosterProvider config={{
  chains: [...evmChains, solanaMainnet],
  readClientFactories: [evmReadClientFactory, svmReadClientFactory],
}}>
```

> **Phase 3:** Auto-contribute read factories from registered adapters (zero-config for apps that already have wallet/transaction adapters). Add optional `address` param and `explorerAddressUrl` to the return. Currently `readClientFactories` must be explicitly provided.

### useChainRegistry

Access to chain metadata without any adapter.

```typescript
function useChainRegistry(): ChainRegistry
```

Returns the registry built by the provider. Useful for components that need chain metadata (explorer links, chain selectors) without wallet or transaction context.

### Hook mapping from current codebase

| Current hook | Replacement |
|---|---|
| `useWeb3Status()` | `useWallet({ chainType: 'evm' })` |
| `useWalletStatus({ chainId })` | `useWallet({ chainId })` — same `isReady`/`needsConnect`/`needsChainSwitch` |
| `useWeb3StatusConnected()` | `useWallet()` inside a `WalletGuard` — guard guarantees `status.connected === true`, no special hook needed |
| `useWaitForTransactionReceipt` | Inside `useTransaction()` — consumers never call directly |
| `useSignMessage` | `useWallet().signMessage()` |
| `useTransactionNotification` | Global lifecycle hooks in provider — no explicit hook needed |

### Escape hatch progression

1. Use `<TransactionButton>` (style package) — zero boilerplate
2. Use `useTransaction()` (react) — control UI, SDK handles lifecycle
3. Use `useTransaction().adapter` — raw adapter for one-off customization
4. Pass explicit `adapter` prop — bypass provider entirely
5. Use `@dappbooster/core` directly — no React, no provider, no hooks

Each level peels back one layer. Agents default to level 1. Experienced devs go to level 2. Edge cases go deeper.
