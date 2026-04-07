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

## 1. Chain Descriptor and Registry

Chain metadata is a foundational concern — independent of wallets, transactions, or any adapter. Explorer URLs, native currency, chain names, address formats, and RPC endpoints are properties of the chain itself.

The descriptor was designed after analyzing 23+ blockchain ecosystems to ensure no structural refactoring is needed when adding support for new chain types. See Appendix A for the chain tier analysis.

### ChainDescriptor

```typescript
interface ChainDescriptor {
  // Universal cross-chain identifier (CAIP-2 standard)
  // Examples: 'eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
  //           'cosmos:cosmoshub-4', 'polkadot:91b171bb158e2d38'
  caip2Id: string

  // Native chain identifier (as the chain knows itself)
  // EVM: number (1, 137, 42161). Cosmos: string ('cosmoshub-4').
  // Solana: string (genesis hash). TON: number (-239). StarkNet: string ('SN_MAIN').
  chainId: string | number

  // Human-readable chain name
  name: string

  // VM/ecosystem family
  chainType: string  // 'evm' | 'svm' | 'movevm-sui' | 'movevm-aptos' | 'cosmos' | 'starknet' | 'substrate' | 'near' | 'ton'

  // Primary currency (staking, transfers, display)
  nativeCurrency: CurrencyInfo

  // Gas/fee currency — only when different from nativeCurrency
  // StarkNet: STRK, Berachain: BERA, Cosmos: may differ from staking token
  feeCurrency?: CurrencyInfo

  // Block explorer configuration
  explorer?: ExplorerConfig

  // Network endpoints — typed by protocol
  endpoints?: EndpointConfig[]

  // Address format metadata
  addressConfig: AddressConfig

  // Chain icon (URL or data URI — for SwitchChain selector, chain badges)
  icon?: string

  // Testnet flag
  testnet?: boolean
}

interface CurrencyInfo {
  symbol: string
  decimals: number
  name?: string
}
```

#### ExplorerConfig

```typescript
interface ExplorerConfig {
  name?: string              // 'Etherscan', 'Solscan', 'Mintscan'
  url: string                // 'https://etherscan.io'
  txPath: string             // '/tx/{id}' — generic {id} placeholder, NOT {hash}
  addressPath: string        // '/address/{id}'
  blockPath?: string         // '/block/{id}'
  queryParams?: Record<string, string>  // Solana: { cluster: 'mainnet-beta' }
}
```

The `{id}` placeholder is chain-agnostic — it works for EVM tx hashes, Solana signatures, Sui digests, Aptos version numbers, and any future identifier format. `queryParams` are appended to all explorer URLs for the chain (handles Solana's `?cluster=mainnet-beta` pattern).

#### EndpointConfig

```typescript
interface EndpointConfig {
  url: string
  protocol: 'json-rpc' | 'rest' | 'graphql' | 'grpc' | 'websocket'
  purpose?: 'default' | 'indexer' | 'archive' | 'streaming'
}
```

Typed by protocol because chain ecosystems vary:
- **EVM**: `json-rpc` (default) + `websocket` (streaming)
- **Cosmos**: `json-rpc` (CometBFT) + `grpc` + `rest` (LCD)
- **Aptos**: `rest` (default) + `graphql` (indexer)
- **Sui**: `json-rpc` (default) + `graphql` (indexer)
- **Solana**: `json-rpc` (default) + `websocket` (PubSub)

Adapters pick the endpoint type they need. The `purpose` field disambiguates when multiple endpoints of the same protocol exist.

#### AddressConfig

```typescript
interface AddressConfig {
  // Address encoding format
  format: 'hex' | 'base58' | 'bech32' | 'bech32m' | 'ss58' | 'named' | 'other'
  // Chain-specific prefix (Cosmos HRP: 'cosmos', 'osmo'. Polkadot SS58 prefix. MultiversX: 'erd1')
  prefix?: string
  // Validation patterns (array — some chains support multiple valid address formats)
  patterns: RegExp[]
  // Example address for documentation/testing
  example?: string
}
```

`patterns` is an array because some chains accept multiple address formats (e.g., Sui accepts both `0x` hex and Bech32m in the future). Most chains have one pattern — the array doesn't add DX cost but keeps the door open.

#### Design decisions

- **`caip2Id` is required, `chainId` is also required.** CAIP-2 is for cross-chain lookups and interoperability. `chainId` is the native value the chain uses internally (passed to wallets, RPC calls, etc.). Both are needed.
- **`feeCurrency` is optional, separate from `nativeCurrency`.** Most chains use the same token for both. When they differ (StarkNet: ETH native + STRK for fees, Berachain: tri-token, Cosmos: staking ≠ fee denom), `feeCurrency` captures the gas/fee token.
- **`addressConfig` is required** (not optional). Every chain has an address format. Making it required prevents runtime errors from missing metadata.
- **`testnet` flag** distinguishes test networks without encoding it in the chain name.
- **Dual-VM chains (Sei)** are registered as two separate ChainDescriptors — `{ caip2Id: 'eip155:1329', chainType: 'evm' }` and `{ caip2Id: 'cosmos:pacific-1', chainType: 'cosmos' }`. From the SDK's perspective, these are different chains with different adapters. The shared infrastructure is transparent.
- **No `stateModel`, `parentChain`, or `accountModel` fields.** These are adapter concerns, not descriptor concerns. The ChainDescriptor describes identity and metadata, not execution model.
- **`supportedChains` must be consistent with the adapter's `chainType`.** If a wallet adapter declares `chainType: 'evm'`, every entry in its `supportedChains` must have `chainType: 'evm'`. The provider validates this at initialization.

### Chain registry

The registry is a lookup structure built from `ChainDescriptor` arrays. It resolves chains by `chainId`, `caip2Id`, or `chainType`.

```typescript
interface ChainRegistry {
  getChain(chainId: string | number): ChainDescriptor | null
  getChainByCaip2(caip2Id: string): ChainDescriptor | null
  getChainType(chainId: string | number): string | null
  getChainsByType(chainType: string): ChainDescriptor[]
  getAllChains(): ChainDescriptor[]
}

function createChainRegistry(chains: ChainDescriptor[]): ChainRegistry
```

If two descriptors declare the same `chainId` or the same `caip2Id`, `createChainRegistry` throws at construction time — fail fast, fail loud.

### Explorer URL utility

Works anywhere — React, Node, CLI. No adapter or provider required.

```typescript
function getExplorerUrl(
  registry: ChainRegistry,
  params:
    | { chainId: string | number; tx: string }
    | { chainId: string | number; address: string }
    | { chainId: string | number; block: string | number }
): string | null
```

The `tx` parameter (not `txHash`) is chain-agnostic — it accepts whatever identifier the chain uses for transactions (hash, signature, digest, version number).

The SDK ships default `ChainDescriptor` sets for EVM chains via a factory function:

```typescript
import { mainnet, optimism, arbitrum } from 'viem/chains'
import { fromViemChain } from '@dappbooster/core/evm'

const chains = [mainnet, optimism, arbitrum].map(fromViemChain)
// Each gets caip2Id, chainId, explorer, endpoints, addressConfig auto-populated from viem
```

Other ecosystem descriptors ship with their respective adapter packages (`@dappbooster/solana`, `@dappbooster/cosmos`, etc.).

---

## 2. Adapter Interfaces

Two adapter interfaces, independently implementable. A wallet-only app (auth, token-gating) skips the transaction adapter. A read-only app (portfolio tracker) skips both. A full dApp uses both.

All interfaces follow **Design by Contract**: preconditions, postconditions, and invariants are explicitly stated. Adapters that violate contracts throw typed errors. Consumers that violate preconditions receive clear error messages at the call site.

### WalletAdapter

Owns connection lifecycle and signing for a chain type.

```typescript
interface WalletAdapter<TChainType extends string = string> {
  // --- Invariants ---
  // chainType never changes after construction
  // supportedChains never changes after construction
  // Every entry in supportedChains has chainType matching this.chainType
  readonly chainType: TChainType
  readonly supportedChains: ChainDescriptor[]

  // --- Connection lifecycle ---

  // connect()
  //   Precondition:  none (can be called when connected — reconnects)
  //   Postcondition: getStatus().connected === true
  //   Postcondition: result.accounts.length >= 1
  //   Postcondition: result.activeAccount is included in result.accounts
  //   Throws:        WalletConnectionRejectedError if user cancels
  //   Throws:        WalletNotInstalledError if wallet extension is not available
  connect(options?: ConnectOptions): Promise<WalletConnection>

  // reconnect()
  //   Precondition:  none
  //   Postcondition: if session exists → returns WalletConnection, getStatus().connected === true
  //   Postcondition: if no session  → returns null, getStatus() unchanged
  //   Note:          for session persistence on page reload. Never throws — returns null on failure.
  reconnect(): Promise<WalletConnection | null>

  // disconnect()
  //   Precondition:  none (no-op if already disconnected)
  //   Postcondition: getStatus().connected === false
  //   Postcondition: getSigner() === null
  disconnect(): Promise<void>

  // --- State ---

  // getStatus()
  //   Precondition:  none (callable at any time)
  //   Postcondition: returns current snapshot — not reactive
  //   Invariant:     if connected === false → activeAccount === null, connectedChainIds === []
  //   Invariant:     if connected === true  → activeAccount !== null, connectedChainIds.length >= 1
  getStatus(): WalletStatus

  // onStatusChange()
  //   Precondition:  none
  //   Postcondition: listener fires on every status change
  //   Returns:       unsubscribe function — calling it stops notifications
  onStatusChange(listener: (status: WalletStatus) => void): () => void

  // --- Signing ---

  // signMessage()
  //   Precondition:  getStatus().connected === true
  //   Postcondition: result.address matches the signing account
  //   Throws:        WalletNotConnectedError if precondition violated
  //   Throws:        SigningRejectedError if user cancels
  signMessage(input: SignMessageInput): Promise<SignatureResult>

  // signTypedData() — OPTIONAL capability (EIP-712 on EVM, ADR-036 on Cosmos)
  //   Precondition:  getStatus().connected === true
  //   Precondition:  metadata.capabilities.signTypedData === true
  //   Throws:        CapabilityNotSupportedError if capability is false
  //   Throws:        WalletNotConnectedError if not connected
  //   Throws:        SigningRejectedError if user cancels
  signTypedData?(input: SignTypedDataInput): Promise<SignatureResult>

  // getSigner()
  //   Precondition:  none
  //   Postcondition: if connected → returns chain-native signer (never null)
  //   Postcondition: if not connected → returns null
  //   Note:          the returned signer is opaque to the SDK. TransactionAdapter validates it.
  //   Note:          async because underlying client retrieval (e.g. wagmi getWalletClient) is async.
  getSigner(): Promise<ChainSigner | null>

  // switchChain()
  //   Precondition:  getStatus().connected === true
  //   Precondition:  chainId is in supportedChains
  //   Postcondition: chainId is included in getStatus().connectedChainIds
  //   Throws:        WalletNotConnectedError if not connected
  //   Throws:        ChainNotSupportedError if chainId not in supportedChains
  //   Throws:        CapabilityNotSupportedError for wallets that can't switch (Keplr — already multi-chain)
  //   Note:          for multi-chain wallets (Keplr), this may be a no-op if already connected to the chain
  switchChain(chainId: string | number): Promise<void>

  // --- Metadata ---
  readonly metadata: WalletAdapterMetadata
}

interface ConnectOptions {
  chainId?: string | number // preferred chain to connect to
}

interface WalletConnection {
  accounts: string[]     // all accounts returned by wallet (MetaMask can have multiple)
  activeAccount: string  // the primary/selected account
  chainId?: string | number
}

interface WalletStatus {
  connected: boolean
  activeAccount: string | null         // the primary account, null if disconnected
  connectedChainIds: (string | number)[]  // EVM: single element. Keplr: multiple Cosmos chains. Empty if disconnected.
  connecting: boolean
}

interface SignMessageInput {
  message: string | Uint8Array
}

interface SignTypedDataInput {
  // EIP-712 structure — EVM-specific. Other chains define their own typed data format.
  domain: Record<string, unknown>
  types: Record<string, unknown>
  primaryType: string
  message: Record<string, unknown>
}

interface SignatureResult {
  signature: string
  address: string   // the account that signed
  meta?: Record<string, unknown> // chain-specific extras (publicKey for Sui/Aptos, chainId for EVM)
}

// Opaque — produced by WalletAdapter, consumed by TransactionAdapter.
// For EVM: wagmi WalletClient. For SVM: @solana/wallet-adapter signer. Etc.
// TransactionAdapter MUST validate the signer type at execute() boundary with a type guard.
type ChainSigner = unknown

interface WalletAdapterMetadata {
  chainType: string

  // Capabilities — declare what this adapter supports.
  // Consumers MUST check capabilities before calling optional methods.
  capabilities: {
    signTypedData: boolean   // EIP-712 (EVM), ADR-036 (Cosmos). False for SVM, Sui, etc.
    switchChain: boolean     // true for EVM. false for multi-chain wallets (Keplr).
    // Future: sessionKeys, batchTransactions, etc.
  }

  // formatAddress() — display formatting (truncation, checksum, prefix display)
  //   Called by: hooks (useWallet returns formatted address), components, or consumers directly
  //   Uses: ChainDescriptor.addressConfig for format type, but applies chain-specific logic
  //         (e.g., EVM checksumming, Cosmos prefix display)
  formatAddress(address: string): string

  availableWallets(): WalletInfo[]
}

interface WalletInfo {
  id: string        // 'metamask', 'phantom', 'keplr', etc.
  name: string      // display name
  icon?: string     // URL or data URI
  installed: boolean
  installUrl?: string
}
```

#### Design decisions

- **`WalletStatus` tracks multiple chains.** `connectedChainIds` is an array. EVM wallets (MetaMask) report one chain. Multi-chain wallets (Keplr) report all connected chains simultaneously. The `useWallet` hook uses `connectedChainIds.includes(targetChainId)` to determine `needsChainSwitch`.
- **`WalletConnection` returns multiple accounts.** wagmi's `connect()` returns `accounts[]`. MetaMask can have multiple selected. `activeAccount` is the primary; `accounts` is the full list.
- **`reconnect()` returns null instead of throwing.** Session restoration is best-effort — a missing session is not an error. Called on page load, fails silently if no session exists.
- **`signTypedData` is optional via capability.** EIP-712 is EVM-specific. Solana, Sui, and other chains have no equivalent. Adapters declare `capabilities.signTypedData: boolean`. Calling `signTypedData()` on an adapter that doesn't support it throws `CapabilityNotSupportedError`.
- **`switchChain` is on the adapter**, not just the hook. For EVM it wraps wagmi's `switchChain`. For multi-chain wallets (Keplr), it's a no-op if already connected to the target chain. Adapters that can't switch declare `capabilities.switchChain: false`.
- **`ChainSigner` is opaque, but validated.** The wallet adapter produces it, the transaction adapter consumes it. The transaction adapter MUST validate the signer with a type guard at the `execute()` boundary — a mismatched signer throws `InvalidSignerError` with a clear message, not a cryptic `writeContract is not a function`.
- **`WalletStatus` is intentionally minimal.** No balance, no ENS, no avatar. Those are data/presentation concerns that belong in the data layer or style package.
- **`formatAddress()` caller is explicit.** Hooks call it for display; components call it for rendering. Consumers can call it directly. It uses `ChainDescriptor.addressConfig` to determine the format type but applies chain-specific logic (EVM checksumming, Cosmos prefix, truncation).

### TransactionAdapter

Owns the four-phase transaction lifecycle for a chain type. Optional — not needed for auth-only or read-only apps.

```typescript
interface TransactionAdapter<TChainType extends string = string> {
  // --- Invariants ---
  // chainType never changes after construction
  // supportedChains never changes after construction
  // Every entry in supportedChains has chainType matching this.chainType
  readonly chainType: TChainType
  readonly supportedChains: ChainDescriptor[]

  // prepare()
  //   Precondition:  params.chainId is in supportedChains
  //   Postcondition: if ready === true → execute() can be called with these params
  //   Postcondition: if ready === false → reason explains why (human-readable)
  //   Postcondition: preSteps (if any) are CONSUMER-PROVIDED, not auto-detected
  //   Note:          prepare() does NOT auto-detect ERC-20 approvals. Consumers provide
  //                  preSteps explicitly, or use the optional approval hint on EVM payloads.
  //   Throws:        ChainNotSupportedError if chainId not in supportedChains
  prepare(params: TransactionParams): Promise<PrepareResult>

  // execute()
  //   Precondition:  signer is a valid ChainSigner for this adapter's chainType
  //   Precondition:  params.chainId is in supportedChains
  //   Postcondition: returns TransactionRef with a unique id
  //   Postcondition: the transaction has been submitted to the network (not yet confirmed)
  //   Throws:        InvalidSignerError if signer type doesn't match (validated via type guard)
  //   Throws:        SigningRejectedError if user cancels
  //   Throws:        InsufficientFundsError if balance too low
  execute(params: TransactionParams, signer: ChainSigner): Promise<TransactionRef>

  // confirm()
  //   Precondition:  ref was returned by a previous execute() call on this adapter
  //   Postcondition: result.status is 'success', 'reverted', or 'timeout'
  //   Postcondition: if 'success' → result.receipt contains chain-specific receipt data
  //   Note:          blocks until finality or timeout. Timeout is configurable.
  //   Throws:        never (timeout returns TransactionResult with status: 'timeout')
  confirm(ref: TransactionRef, options?: ConfirmOptions): Promise<TransactionResult>

  // --- Metadata ---
  readonly metadata: TransactionAdapterMetadata
}

interface TransactionParams {
  chainId: string | number
  payload: unknown // chain-specific — typed by the concrete adapter implementation
  // Consumer-provided pre-steps (e.g., token approval before swap)
  preSteps?: PreStep[]
}

interface PrepareResult {
  ready: boolean
  reason?: string // 'Insufficient balance', 'Wrong network', etc.
  estimatedFee?: {
    amount: string
    symbol: string
    decimals: number
  }
}

interface PreStep {
  label: string
  params: TransactionParams
}

interface TransactionRef {
  chainType: string
  id: string // tx hash on EVM, signature on SVM — opaque to consumers
  chainId: string | number
}

interface ConfirmOptions {
  confirmations?: number
  timeout?: number // ms
}

interface TransactionResult {
  status: 'success' | 'reverted' | 'timeout'
  ref: TransactionRef
  receipt: unknown // chain-specific — typed by the concrete adapter implementation
}

interface TransactionAdapterMetadata {
  chainType: string
  feeModel: string       // 'eip1559' | 'legacy' | 'priority-fee' | 'compute-units' | ...
  confirmationModel: string // 'block-confirmations' | 'slot-finality' | ...
}
```

#### Design decisions

- **PreSteps are consumer-provided, not auto-detected.** The adapter cannot generically detect that a contract call needs a token approval — that requires business-domain knowledge (which token, which spender, what amount). Consumers provide `preSteps` in `TransactionParams`. For EVM, an optional `approval` hint on the payload enables consumer-guided detection (see Section 7).
- **`preSteps` moved from `PrepareResult` to `TransactionParams`.** Consumers declare prerequisites up front. `prepare()` validates them (e.g., checks if the approval is already sufficient) and reports readiness. This makes the contract explicit: the consumer knows what steps are needed, the adapter validates and executes them.
- **`payload` is opaque (`unknown`).** Type safety comes from the concrete adapter, not the interface.
- **`receipt` is opaque.** EVM returns a `TransactionReceipt` (viem), SVM returns slot data, Cosmos returns `DeliverTxResponse`.
- **`confirm()` never throws.** Timeouts and reverts are expected outcomes, not exceptions. They return as `TransactionResult.status`.
- **`execute()` validates its signer.** Each adapter uses a type guard at the `execute()` boundary. Passing an SVM signer to an EVM adapter throws `InvalidSignerError` with a clear message.
- **`supportedChains` on both adapters** allows independent chain support. A wallet adapter might support 10 EVM chains while the transaction adapter supports only 3 (the ones with deployed contracts).
- **`supportedChains` must be consistent with the adapter's `chainType`.** If a wallet adapter declares `chainType: 'evm'`, every entry in its `supportedChains` must have `chainType: 'evm'`. The provider validates this at initialization.

### ReadClientFactory

Creates public (read-only) clients for chains without wallet or transaction adapters. Used by `useReadOnly` for the zero-adapter, read-only use case (portfolio trackers, data dashboards).

```typescript
interface ReadClientFactory {
  // Invariant: chainType never changes after construction
  readonly chainType: string

  // createClient()
  //   Precondition:  endpoint URL is reachable
  //   Postcondition: returns a public client capable of read-only chain queries
  //   Note:          client type is chain-specific (viem PublicClient for EVM, Connection for SVM)
  createClient(endpoint: EndpointConfig, chainId: string | number): unknown
}
```

The SDK ships `evmReadClientFactory` (wraps viem's `createPublicClient`). Other factories ship with their adapter packages. When a wallet or transaction adapter is registered, its read-client factory is included automatically.

---

## 3. Lifecycle Hooks

Intervention points for cross-cutting concerns: notifications, analytics, logging, monitoring. Two scopes, two interfaces.

### TransactionLifecycle

Hooks into the transaction four-phase cycle.

```typescript
interface TransactionLifecycle {
  onPrepare?: (result: PrepareResult) => void
  onPreStep?: (step: PreStep, index: number) => void
  onPreStepComplete?: (step: PreStep, index: number, result: TransactionResult) => void
  onSubmit?: (ref: TransactionRef) => void
  onConfirm?: (result: TransactionResult) => void
  onError?: (phase: TransactionPhase, error: Error) => void
  onReplace?: (oldRef: TransactionRef, newRef: TransactionRef, reason: string) => void
}

type TransactionPhase = 'prepare' | 'preStep' | 'submit' | 'confirm'
```

### WalletLifecycle

Hooks into wallet signing activity.

```typescript
interface WalletLifecycle {
  onSign?: (type: 'message' | 'typedData', input: SignMessageInput | SignTypedDataInput) => void
  onSignComplete?: (result: SignatureResult) => void
  onSignError?: (error: Error) => void
}
```

### Two scopes of lifecycle hooks

**Global hooks** — registered in the provider config. Applied to every transaction and every signing operation. This is where the notification system, analytics, and logging live:

```typescript
// Notification system as a global lifecycle hook — created via factory with injected toaster
const notificationLifecycle = createNotificationLifecycle({ toaster })

// Factory implementation (shipped by @dappbooster/react):
interface ToasterAPI {
  create(options: { id?: string; title: string; description?: string; type?: string }): void
  update(id: string, options: { title: string; description?: string; type?: string }): void
  dismiss(id: string): void
}

function createNotificationLifecycle(options: {
  toaster: ToasterAPI
  messages?: {
    submitted?: string
    confirmed?: string
    failed?: string
    error?: (phase: string, error: Error) => string
  }
}): TransactionLifecycle {
  return {
    onSubmit: (ref) =>
      toaster.create({ id: ref.id, title: messages.submitted ?? 'Transaction submitted' }),
    onConfirm: (result) =>
      toaster.update(result.ref.id, {
        title: result.status === 'success'
          ? (messages.confirmed ?? 'Transaction confirmed')
          : (messages.failed ?? 'Transaction failed'),
      }),
    onError: (phase, error) =>
      toaster.create({ title: messages.error?.(phase, error) ?? error.message, type: 'error' }),
    // Phase 3: onReplace — EVM-specific: fires when tx is sped up or cancelled (same nonce, higher gas).
    // Not yet dispatched by useTransaction. When implemented, non-EVM adapters never fire this.
  }
}

const walletNotifications: WalletLifecycle = {
  onSign: (type) => showToast('Signature requested...'),
  onSignComplete: () => dismissToast(),
  onSignError: (error) => showToast(formatError(error)),
}
```

**Per-operation hooks** — passed by the consumer to `useTransaction()`. Applied to a single transaction:

```typescript
const tx = useTransaction({
  params: swapParams,
  lifecycle: {
    onConfirm: (result) => invalidateBalanceQueries(),
    onPreStep: (step) => showApprovalModal(step),
  },
})
```

Note: `WalletLifecycle` hooks are global-only (registered in provider config). There is no per-operation wallet lifecycle on `useWallet()` — signing operations fire the global wallet lifecycle hooks. This is intentional: signing is atomic (no multi-phase flow), so per-operation hooks add no value beyond what the `signMessage()`/`signTypedData()` Promise resolution already provides.

### Merge behavior

Both scopes always fire for `TransactionLifecycle`. Global first, then per-operation. Neither swallows the other. An error thrown in a lifecycle hook is caught and logged — it never aborts the transaction. Lifecycle hooks are observers, not interceptors.

### Naming: `onSubmit` vs `onSign`

`TransactionLifecycle.onSubmit` fires when a transaction is being submitted to the chain. `WalletLifecycle.onSign` fires when a message or typed data is being signed. These are distinct operations:

- Submitting a transaction involves signing, but also broadcasting to the network and waiting for inclusion.
- Signing a message is a local operation — no network submission, no confirmation.

The naming makes the distinction clear. The notification system hooks into both: `onSubmit` for "Transaction sent...", `onSign` for "Signature requested...".

### How lifecycle hooks map to the current codebase

| Current code | Becomes |
|---|---|
| `TransactionNotificationProvider.watchTx()` | Global `onSign` (wallet lifecycle) + `onSubmit` (transaction lifecycle) |
| `TransactionNotificationProvider.watchHash()` | Global `onSubmit` + `onConfirm` + `onReplace` |
| `TransactionNotificationProvider.watchSignature()` | `WalletAdapter.signMessage()` + global `onSign` (wallet lifecycle) |
| `TransactionButton.onMined(receipt)` | Per-operation `onConfirm` |
| `useWaitForTransactionReceipt` | Inside `TransactionAdapter.confirm()` |

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
import { createEvmWalletAdapter, createEvmTransactionAdapter } from '@dappbooster/core'
import { connectkitConnector } from '@dappbooster/core/evm/connectors'
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
import { evmChains } from '@dappbooster/core/chains'

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

---

## 6. Component Layer (Style Packages)

Components live in style packages (`@dappbooster/chakra`, future `@dappbooster/tailwind`, etc.). They are thin wrappers around hooks — typically 20-40 lines each. The hook does the work, the component does the rendering.

### Why style packages are separate

The SDK's logic has zero UI dependencies. A consumer using Tailwind doesn't install Chakra. A consumer using Vue doesn't install React. The headless core stands alone.

A Chakra `TransactionButton` and a Tailwind `TransactionButton` call the same `useTransaction()` hook. The only difference is the markup. Building a new style package means writing thin wrappers, not reimplementing logic.

### TransactionButton

```typescript
interface TransactionButtonProps {
  // Transaction configuration — chainId is inside params (single source of truth)
  params: TransactionParams
  lifecycle?: TransactionLifecycle
  autoPreSteps?: boolean           // default: false
  confirmations?: number
  connectFallback?: ReactElement
  switchChainFallback?: ReactElement
  label?: string
  labelSigning?: string
  labelConfirming?: string
  children?: ReactNode
  // + style library props (Chakra ButtonProps, etc.)
}
```

This is a **new API** — there is no backwards-compatible `transaction: () => Promise<Hash>` prop. The adapter architecture is a new major version. Consumers migrating from the current codebase adopt the new props; see Section 12 (Migration Path) for the phased approach.

Internal structure (Chakra example, ~30 lines):

```tsx
function TransactionButton({ params, lifecycle, label, ...chakraProps }) {
  const wallet = useWallet({ chainId: params.chainId })
  const tx = useTransaction({ params, lifecycle })

  if (wallet.needsConnect) {
    return <ConnectWalletButton {...chakraProps} />
  }
  if (wallet.needsChainSwitch) {
    return (
      <Button onClick={() => wallet.switchChain(params.chainId)} {...chakraProps}>
        Switch to {wallet.chainName}
      </Button>
    )
  }

  return (
    <Button onClick={tx.execute} loading={tx.phase !== 'idle'} {...chakraProps}>
      {tx.phase === 'confirm' ? labelConfirming : label}
    </Button>
  )
}
```

### SignButton

```typescript
interface SignButtonProps {
  chainId?: string | number
  message: string | Uint8Array
  lifecycle?: WalletLifecycle
  connectFallback?: ReactElement
  switchChainFallback?: ReactElement
  label?: string
  labelSigning?: string
  children?: ReactNode
}
```

Same wallet gating logic as TransactionButton. Calls `useWallet().signMessage()` on click. No transaction adapter needed.

### WalletGuard

Gates children on wallet connection requirements. Lives in the style package because the fallback rendering is a styling concern.

```typescript
interface WalletGuardProps {
  chainId?: string | number
  chainType?: string
  fallback?: ReactElement    // defaults to <ConnectWalletButton chainId={chainId} chainType={chainType} />
  switchChainLabel?: string  // defaults to 'Switch to'
  children?: ReactNode
}
```

Usage:

```tsx
// Gate on specific chain
<WalletGuard chainId={1}>
  <SwapUI />
</WalletGuard>

// Gate on chain type (auth-only / multi-platform signing)
<WalletGuard chainType="evm">
  <SigningUI />
</WalletGuard>
```

The guard's job is binary: wallet connected (and on correct chain if `chainId` provided)? Yes → render children. No → render fallback. The default fallback renders a `ConnectWalletButton` scoped to the same chain, or a `SwitchChainButton` when connected but on the wrong chain.

> **Phase 3:** Multi-chain gating — `require: WalletRequirement[]` for bridge-style UX requiring multiple simultaneous wallet connections. Currently single-chain only; bridges compose two `useWallet` calls in consumer-land.

A consumer not using a style package builds the same guard in ~5 lines with hooks:

```tsx
function MyGuard({ children }) {
  const { needsConnect, connect } = useWallet({ chainId: 1 })
  if (needsConnect) return <button onClick={connect}>Connect</button>
  return children
}
```

### ConnectWalletButton

```typescript
// Accepts all UseWalletOptions (chainId, chainType, adapter) for adapter resolution
interface ConnectWalletButtonProps extends UseWalletOptions {
  label?: string  // defaults to 'Connect'
}
```

Resolves the wallet adapter via `useWallet(options)` and calls `openConnectModal()` to open the adapter-specific connector modal. Displays the truncated address when connected. In multi-wallet setups, pass `chainType` or `chainId` to target a specific adapter's modal.

The component does NOT depend on wagmi or any chain-specific import — it uses `useWallet().status` for connection state and `useWallet().openConnectModal` for the modal trigger, making it fully adapter-agnostic.

### ExplorerLink

Chain-agnostic — resolved from the chain registry, not from any adapter.

```typescript
interface ExplorerLinkProps {
  chainId: string | number
  tx?: string             // chain-agnostic: hash, signature, digest, version number
  address?: string
  block?: string | number
  truncate?: boolean
  children?: ReactNode
}
```

Internally calls `getExplorerUrl()` from the chain registry. Works for any chain with an `ExplorerConfig` in its descriptor — whether it came from an adapter's `supportedChains` or from explicit `chains` config.

### SwitchChain

Chain selector dropdown. Shows chains from all registered adapters.

```typescript
interface SwitchChainProps {
  chainType?: string // filter to one chain type, or show all
  onChange?: (chainId: string | number) => void
}
```

### Style package component summary

| Component | Hook(s) used | Purpose |
|---|---|---|
| `TransactionButton` | `useWallet` + `useTransaction` | One-click transaction with wallet gating |
| `SignButton` | `useWallet` | Message signing with wallet gating |
| `WalletGuard` | `useWallet` / `useMultiWallet` | Gate children on wallet requirements |
| `ConnectWalletButton` | `useWallet` | Trigger wallet connection |
| `ExplorerLink` | `useChainRegistry` | Chain-aware explorer links |
| `SwitchChain` | `useWallet` + `useChainRegistry` | Chain selector |
| `NotificationToaster` | (lifecycle hooks) | Global transaction/signing notifications |

---

## 7. EVM Adapter Implementation

The only adapter the SDK ships at launch. It wraps the existing dAppBooster code — no new EVM logic, just formalization behind the adapter interfaces.

### EvmWalletAdapter

```typescript
function createEvmWalletAdapter(config: EvmWalletConfig): WalletAdapterBundle

interface EvmWalletConfig {
  chains: Chain[]                     // from viem/chains
  transports?: Record<number, Transport>
  connector: EvmConnectorConfig
}
```

The factory returns a `WalletAdapterBundle` (adapter + Provider). The Provider composes WagmiProvider + QueryClientProvider + the connector's WalletProvider. This is how DAppBoosterProvider gets wagmi into the React tree without the consumer seeing the nesting.

**EvmConnectorConfig is split between core and react:**

```typescript
// In @dappbooster/core/evm — framework-agnostic part
interface EvmCoreConnectorConfig {
  createConfig: (chains: Chain[], transports: Record<number, Transport>) => WagmiConfig
}

// In @dappbooster/react/evm — React-specific part (returned by connector subpath exports)
interface EvmConnectorConfig extends EvmCoreConnectorConfig {
  WalletProvider: FC<{ children: ReactNode }>  // ConnectKitProvider, RainbowKitProvider, etc.
  useConnectModal: () => { open: () => void }  // hook to open the connector's connect/account modal
}
```

Non-React consumers (CLI, agents) use `createEvmServerWallet()` which needs only `EvmCoreConnectorConfig` — no React types, no Provider component.

Internal mapping (uses `@wagmi/core` actions, NOT React hooks — framework-agnostic):

| WalletAdapter method | EVM implementation |
|---|---|
| `connect()` | `@wagmi/core` `connect()` action + connector modal subscription |
| `reconnect()` | `@wagmi/core` `reconnect()` action |
| `disconnect()` | `@wagmi/core` `disconnect()` action |
| `getStatus()` | `@wagmi/core` `getAccount()` → maps to `WalletStatus` |
| `onStatusChange()` | `@wagmi/core` `watchAccount()` + `watchChainId()` |
| `signMessage()` | `@wagmi/core` `signMessage()` action |
| `signTypedData()` | `@wagmi/core` `signTypedData()` action |
| `getSigner()` | Returns wagmi `WalletClient` via `getWalletClient()` |
| `switchChain()` | `@wagmi/core` `switchChain()` action |
| `supportedChains` | Built from `config.chains` via `fromViemChain()` |
| `metadata.capabilities` | `{ signTypedData: true, switchChain: true }` |
| `metadata.availableWallets()` | From connector's wallet discovery |

The three existing connector configs (`connectkit.config.tsx`, `rainbowkit.config.tsx`, `reown.config.tsx`) become `EvmConnectorConfig` implementations.

Connector adapters live as subpath exports of `@dappbooster/core/evm/connectors` (core config) and `@dappbooster/react/evm/connectors` (React Provider/Button). They are EVM wallet connection logic, not styling concerns — a Tailwind app uses the same ConnectKit connector as a Chakra app.

### EvmTransactionAdapter

```typescript
function createEvmTransactionAdapter(config?: EvmTransactionConfig): TransactionAdapter<'evm'>

interface EvmTransactionConfig {
  defaultConfirmations?: number // default: 1
}
```

EVM-specific transaction payload (what consumers pass as `TransactionParams.payload`). This is a discriminated union — you either send a raw transaction or call a contract, never both:

```typescript
type EvmTransactionPayload = EvmRawTransaction | EvmContractCall

interface EvmRawTransaction {
  to: Address
  data?: Hex
  value?: bigint
  // Gas overrides (optional — adapter estimates if omitted)
  gas?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

interface EvmContractCall {
  contract: {
    address: Address
    abi: Abi
    functionName: string
    args?: unknown[]
  }
  value?: bigint
  // Gas overrides (optional — adapter estimates if omitted)
  gas?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}
```

The adapter detects which variant by checking for the presence of `contract` vs `to`.

Four-phase mapping:

| Phase | EVM implementation |
|---|---|
| `prepare()` | Validates signer exists. Estimates gas via `publicClient.estimateGas()`. Checks balance sufficiency. Validates consumer-provided preSteps (e.g., checks if approval allowance is already sufficient and removes unnecessary preSteps). |
| `execute()` | Calls `walletClient.sendTransaction()` for raw transactions or `walletClient.writeContract()` for contract calls. Returns `TransactionRef` with tx hash. |
| `confirm()` | Wraps viem's `publicClient.waitForTransactionReceipt()` with replacement detection (`onReplaced` callback). Fires `onReplace` lifecycle hook if tx is sped up or cancelled. |
| Return | `TransactionResult` with viem `TransactionReceipt` as `receipt`. |

### Generated hooks coexistence

`pnpm wagmi-generate` (to be renamed `pnpm codegen`) still produces typed hooks for specific contracts (`useReadWethAllowance`, `useWriteWethApprove`, etc.). These are EVM-specific convenience hooks with full type safety.

They coexist with the adapter. A developer building an EVM-only app may prefer generated hooks for their type safety and skip the adapter for common contract interactions. The adapter is for the generic, chain-agnostic path.

### EVM PreStep helpers

The SDK ships convenience functions for common PreStep patterns. These are the **only way** to build PreSteps for EVM transactions — agents and developers use these, not manual PreStep construction.

```typescript
import {
  createApprovalPreStep,
  createPermitPreStep,
} from '@dappbooster/core/evm'

// ERC-20 approval before a swap/transfer/deposit
const approvalStep = createApprovalPreStep({
  token: usdcAddress,       // ERC-20 token to approve
  spender: routerAddress,   // contract that will spend the token
  amount: parseUnits('1000', 6),
})
// Returns: PreStep { label: 'Approve USDC', params: { chainId, payload: { contract: approve call } } }
// The EVM adapter's prepare() checks current allowance — if already sufficient, marks preStep as skippable.

// EIP-2612 permit (gasless approval via signature)
const permitStep = createPermitPreStep({
  token: usdcAddress,
  spender: routerAddress,
  amount: parseUnits('1000', 6),
  deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
})
// Returns: PreStep that uses signTypedData instead of a transaction

// Usage with useTransaction:
const tx = useTransaction({ lifecycle: { onConfirm: () => invalidateQueries() } })

// autoPreSteps defaults to true — approval runs automatically before the swap:
await tx.execute({
  chainId: 1,
  payload: swapPayload,
  preSteps: [approvalStep],
})
```

> **Phase 3:** Manual pre-step control via `executePreStep(index)` for per-step approval UX.

Additional helpers to be added as common patterns emerge:
- `createWrapEthPreStep()` — wrap ETH → WETH before operations requiring ERC-20
- `createUnwrapEthPreStep()` — unwrap WETH → ETH after operations

### Adapter wrapping utility

The SDK provides `wrapAdapter()` for composing adapters — adding observation hooks around every method call without implementing a full adapter from scratch. This is the formal mechanism for patterns like logging, analytics, and error monitoring.

```typescript
import { wrapAdapter } from '@dappbooster/core'

// wrapAdapter()
//   Precondition:  adapter is any object with function methods
//   Postcondition: returns a new object with identical interface that delegates to the original
//   Contract:      hooks are fire-and-forget observers — they cannot transform data or abort calls
//   Contract:      hook errors are caught and silently ignored to avoid aborting adapter calls
function wrapAdapter<T extends object>(
  adapter: T,
  hooks: {
    onBefore?(method: string, args: unknown[]): void
    onAfter?(method: string, result: unknown): void
    onError?(method: string, error: Error): void
  },
): T

// Example: logging middleware
const loggingAdapter = wrapAdapter(evmTransactionAdapter, {
  onBefore: (method, args) => console.log(`[${method}] called with`, args),
  onAfter: (method, result) => console.log(`[${method}] returned`, result),
  onError: (method, error) => console.error(`[${method}] threw`, error),
})

// Example: analytics
const trackedAdapter = wrapAdapter(evmWalletAdapter, {
  onAfter: (method, result) => {
    if (method === 'connect') analytics.track('wallet_connected', result)
    if (method === 'signMessage') analytics.track('message_signed')
  },
})
```

`wrapAdapter` works on any object — wallet adapters, transaction adapters, or any other interface. It wraps inherited methods via prototype traversal and preserves synchronous vs asynchronous behavior.

> **Phase 3:** Transforming hooks — `beforePrepare`, `afterExecute`, etc. — that can modify params and results for use cases like FHE encryption. Current hooks are observation-only. For transformation use cases today, consumers implement a custom adapter that delegates internally.

### What doesn't change

- wagmi is the EVM engine under the hood — the adapter wraps it, doesn't replace it
- viem types (`Address`, `Hash`, `Hex`, `Abi`) are used inside the EVM adapter
- The wagmi-cli codegen still works for EVM-specific type generation
- Existing EVM patterns (generated hooks, Suspense reads) continue to work

### EVM library coupling (explicit constraint)

The adapter interfaces (`WalletAdapter`, `TransactionAdapter`) are library-agnostic — they define contracts in terms of generic types (`ChainSigner`, `TransactionParams`, `TransactionRef`). However, the shipped EVM implementation is **structurally coupled to wagmi + viem** at three levels:

1. **Connector system** — `EvmCoreConnectorConfig.createConfig()` returns wagmi's `Config` type. `EvmConnectorConfig.WalletProvider` wraps `WagmiProvider` + `QueryClientProvider`. All three shipped connectors (ConnectKit, RainbowKit, Reown) are wagmi-based.

2. **Adapter internals** — `createEvmWalletAdapter` uses `@wagmi/core` actions (`connect`, `disconnect`, `signMessage`, `getWalletClient`, `watchAccount`, `switchChain`). `createEvmTransactionAdapter` uses viem's `PublicClient` and `WalletClient`. The `ChainSigner` opaque type is a viem `WalletClient` at runtime.

3. **Generated contract hooks** — `pnpm wagmi-generate` produces hooks via `@wagmi/cli` that import a wagmi `Config` instance and use `wagmi/codegen` + `@tanstack/react-query`. These hooks are tightly bound to wagmi's query/cache infrastructure.

**What this means for alternative libraries:**

- **Replacing wagmi with ethers.js for EVM** is not a config swap. It requires a parallel `WalletAdapter<'evm'>` + `TransactionAdapter<'evm'>` implementation, a replacement for the connector system (no `WagmiProvider`), and either dropping generated hooks or building an ethers-based codegen. The practical investment is equivalent to writing a new chain adapter from scratch.

- **Adding non-EVM chains** (SVM, Cosmos, etc.) is the designed extension point. Each chain type gets its own adapter implementations that use whatever library is native to that ecosystem (e.g., `@solana/web3.js` for SVM, `@cosmjs` for Cosmos). These coexist with the EVM adapter — the architecture supports multiple chain types, not multiple libraries for the same chain type.

- **The adapter interface is the stable contract.** If a future EVM library emerges that's superior to wagmi/viem, the migration path is: implement new `WalletAdapter<'evm'>` + `TransactionAdapter<'evm'>`, register them in `DAppBoosterConfig`, and all hook/component consumers work unchanged. The interface boundary protects consumers from implementation churn.

---

## 8. Codegen Generalization

The current `pnpm wagmi-generate` is EVM-specific. As the SDK supports multiple chain types, codegen needs a generic entry point.

### Generic script

```
pnpm codegen
```

Internally dispatches to the right generator based on configuration.

### Output targets

A critical distinction: **React hooks are only useful in React apps.** Agent scripts, CLI tools, relayers, and backend services need framework-agnostic typed clients. The codegen must support both:

| Chain type | Generator | Input | React output | Core output (framework-agnostic) |
|---|---|---|---|---|
| EVM | wagmi-cli | Contract ABIs | Typed React hooks (`useReadWeth...`) | Typed actions (plain async functions via wagmi `actions` plugin) |
| SVM | Anchor / Codama / Kinobi | Program IDLs | — | Typed program clients (already framework-agnostic) |
| Sui | @mysten/sui + Move compiler | Move modules | — | Typed transaction builders (already framework-agnostic) |
| Aptos | @aptos-labs/ts-sdk + Move compiler | Move modules | — | Typed clients (already framework-agnostic) |
| Cosmos | Telescope | Protobuf definitions | — | TypeScript clients (already framework-agnostic) |

Non-EVM generators already produce framework-agnostic output. The EVM case is the exception — wagmi-cli defaults to React hooks. The fix: EVM codegen generates **both** React hooks (for `@dappbooster/react` consumers) and typed actions (for `@dappbooster/core` consumers) via wagmi-cli's `actions` plugin.

Additionally, viem provides typed contract interaction without any codegen:

```typescript
// Framework-agnostic — works in CLI, agent, relayer, anywhere
import { getContract } from 'viem'
const contract = getContract({ address, abi, client: publicClient })
await contract.read.balanceOf([address])
await contract.write.transfer([to, amount])
```

Codegen is a DX convenience for type safety, not a requirement. The adapter's `execute()` accepts raw payloads (ABI + function name + args) and works without generated code.

### Configuration

```typescript
// dappbooster.config.ts
export default {
  codegen: {
    evm: {
      contracts: [...],
      output: {
        react: 'src/contracts/generated.hooks.ts',  // React hooks (optional)
        core: 'src/contracts/generated.ts',          // Framework-agnostic actions
      },
    },
    svm: {
      programs: [...],
      output: 'src/programs/generated.ts',
    },
  },
}
```

Only configured chain types trigger codegen. An EVM-only project runs `pnpm codegen` and only wagmi-cli executes. A Node.js agent project configures only `core` output — no React hooks generated.

---

## 9. Agent Integration and Non-Browser Use Cases

### @dappbooster/core as a blockchain runtime

`@dappbooster/core` is framework-agnostic. It runs anywhere JavaScript runs — browser, Node.js, Deno, Bun, edge functions. This makes it the blockchain interaction layer for:

**AI agent scripts:**

```typescript
import { createEvmTransactionAdapter, createEvmServerWallet } from '@dappbooster/core'

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
import { createChainRegistry, getExplorerUrl } from '@dappbooster/core'

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

Complete working examples (see Section 10).

---

## 10. Reference Use Cases

Each use case demonstrates a different composition of SDK primitives. These are runnable reference apps — not snippets, but complete starting points.

### Use case matrix

| # | Use case | Wallet adapters | Transaction adapters | Packages | Key pattern | Status |
|---|---|---|---|---|---|---|
| 1 | **EVM dApp** (Aave-like) | EVM | EVM | core + react + chakra | Single-chain, generated hooks, TransactionButton | **Ready** — use `createEvmWalletAdapter` + `createEvmTransactionAdapter`, `<TransactionButton params={...}>` |
| 2 | **Auth-only app** (portal-earn-like) | EVM + SVM + Sui + Aptos | None | core + react | Multi-platform wallet signing, no transactions | **EVM only** — use `useWallet({ chainType: 'evm' })` + `signMessage()`. SVM/Sui/Aptos adapters are Phase 4. |
| 3 | **Portfolio tracker** (Rotki-like) | None | None | core + react | Read-only, arbitrary addresses, data fetching | **Partial** — `useReadOnly({ chainId })` returns a client but lacks address param and explorer URL (Phase 3). Use `useChainRegistry()` for chain metadata. |
| 4 | **Cross-chain bridge** | EVM + SVM | EVM + SVM | core + react | Multi-adapter, consumer-land flow orchestrator | **EVM-side only** — compose two `useWallet()` calls + two `useTransaction()` calls in consumer code. SVM adapter is Phase 4. WalletGuard is single-chain; use two guards or compose with hooks. |
| 5 | **Custom-styled dApp** (Tailwind) | EVM | EVM | core + react (no chakra) | Hooks-only, custom components, headless pattern | **Ready** — import `useWallet`, `useTransaction` from `@dappbooster/react`. Build your own components with any CSS framework. |
| 6 | **Agent script** | Server wallet | EVM | core only | Node.js, server-side signer, lifecycle logging, no React | **Ready** — `createEvmServerWallet({ privateKey, chain })` + `createEvmTransactionAdapter(config)`. Call `adapter.execute(params, signer)` directly. |
| 7 | **CLI tool** | Server wallets | Multi-chain | core only | Terminal UX, multi-chain commands, batch operations | **EVM only** — use `createEvmServerWallet` + `createChainRegistry(chains)` + `getExplorerUrl()`. Multi-chain requires Phase 4 adapters. |
| 8 | **Relayer** | Server wallets | Multi-chain | core only | Backend service, lifecycle hooks for monitoring | **EVM only** — same as use case 6 with `wrapAdapter()` for logging/monitoring. Consumer adds nonce management. |
| 9 | **Smart wallet (AA)** | ERC-4337 adapter | Bundler-based adapter | core + react | UserOperations, paymaster, batched calls | **Not started** — requires custom `WalletAdapter` + `TransactionAdapter` implementations. Interfaces support it; no reference adapter ships. |
| 10 | **Gasless app** | EVM (sign only) | Server-side relay | core (client) + core (server) | Client signs permit, server submits and pays gas | **Primitives ready** — client: `useWallet().signTypedData()` for permit. Server: `createEvmServerWallet()` + `createEvmTransactionAdapter()`. Consumer composes the relay logic. |
| 11 | **Multi-sig** (Safe-like) | EVM | EVM (propose/approve) | core + react | Multi-party transaction lifecycle, EIP-712 typed data signing | **Primitives ready** — `useWallet().signTypedData()` for EIP-712. Consumer implements propose/approve/execute flow; SDK provides signing + lifecycle hooks. |
| 12 | **Token-gated app** | EVM (identity only) | None | core + react | Connect wallet, verify ownership, no transactions | **Ready** — `useWallet({ chainId })` for connection + address. `WalletGuard` gates UI. Consumer verifies token ownership off-chain or via `useReadOnly`. |
| 13 | **ZK identity / voting** | EVM | EVM (proof as calldata) | core + react | Proof generation as PreStep, lifecycle hooks for progress | **Partial** — `createApprovalPreStep` pattern works for proof-as-preStep. `autoPreSteps: true` runs it automatically. Manual per-step approval UI is Phase 3. |
| 14 | **FHE private DeFi** | EVM + encryption keys | EVM (encrypted payload) | core + react | Encrypt/decrypt middleware on adapters | **Partial** — current `wrapAdapter()` is observation-only (logging, analytics). Transforming hooks (encrypt/decrypt payloads) are Phase 3. Today: implement a custom `TransactionAdapter` that delegates to the EVM adapter internally. |

### What each validates

- **Use cases 1, 5**: Basic single-chain dApp works with minimal config
- **Use cases 2, 12**: Wallet-only apps (no transaction adapter) are first-class
- **Use case 3**: Zero-adapter apps (read-only) are first-class
- **Use cases 4, 10**: Multi-chain apps compose adapters independently
- **Use cases 6, 7, 8**: Non-browser use cases work with `@dappbooster/core` alone
- **Use case 9**: Adapter interfaces accommodate non-standard transaction models (UserOps, bundlers)
- **Use case 11**: Lifecycle hooks support multi-party flows
- **Use cases 13, 14**: Pre-processing (ZK proofs, FHE encryption) composes with standard adapters via PreStep and middleware

### Agent implementation guide

When an agent needs to implement one of these use cases, follow this decision tree:

1. **Does the app need a wallet connection?** Yes → register wallet adapters in `DAppBoosterConfig.wallets`. No → skip wallets, use `chains` + `readClientFactories` for read-only.
2. **Does the app send transactions?** Yes → register transaction adapters in `DAppBoosterConfig.transactions`. No → skip transactions.
3. **Is this a React app?** Yes → use `DAppBoosterProvider` + hooks (`useWallet`, `useTransaction`). No → use `@dappbooster/core` directly (adapter factories, no provider).
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
import { rainbowkitConnector } from '@/src/sdk/core/evm'  // or connectkitConnector, reownConnector
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
