# Adapter Interfaces and Lifecycle Hooks

> Part of the [dAppBooster adapter architecture spec](../adapter-architecture-spec.md).
> See also: [Chain Registry](./01-chain-registry.md), [Provider and Hooks](./03-provider-and-hooks.md), [EVM Adapter](./05-evm-adapter.md)

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
  //   Note:          signer is optional — adapters use it (when supplied) for accurate gas estimation
  //                  against the connected account. When omitted, fees fall back to public client defaults.
  prepare(params: TransactionParams, signer?: ChainSigner): Promise<PrepareResult>

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

- **PreSteps are consumer-provided, not auto-detected.** The adapter cannot generically detect that a contract call needs a token approval — that requires business-domain knowledge (which token, which spender, what amount). Consumers provide `preSteps` in `TransactionParams`. For EVM, an optional `approval` hint on the payload enables consumer-guided detection (see [EVM Adapter](./05-evm-adapter.md)).
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
interface ReadClientFactory<TClient = unknown> {
  // Invariant: chainType never changes after construction
  readonly chainType: string

  // createClient()
  //   Precondition:  endpoint URL is reachable
  //   Postcondition: returns a public client capable of read-only chain queries
  //   Note:          TClient is chain-specific — e.g., viem PublicClient for EVM, Connection for SVM
  createClient(endpoint: EndpointConfig, chainId: string | number): TClient
}
```

The factory is generic so adapter packages can ship a strongly-typed version: `ReadClientFactory<PublicClient>` for EVM, `ReadClientFactory<Connection>` for SVM. Consumers importing `evmReadClientFactory` from `@dappbooster/evm-adapter` get `PublicClient` inferred automatically through `useEvmReadOnly()` or `useReadOnly({ factory: evmReadClientFactory })`.

Each wallet bundle can auto-contribute its factory via `WalletAdapterBundle.readClientFactory` — `DAppBoosterProvider` collects them (deduped by `chainType`) into the internal factory registry, so consumers of adapter-registered chains do not need to pass `readClientFactories` explicitly. See [Provider and Hooks](./03-provider-and-hooks.md#usereadonly).

### WalletAdapterBundle

Factories that need React providers return a bundle instead of a bare adapter. The bundle type is defined here (interface layer) and consumed by `DAppBoosterProvider`.

```typescript
interface WalletAdapterBundle {
  adapter: WalletAdapter
  // React provider required by this adapter (e.g., WagmiProvider + QueryClientProvider + connector Provider).
  // Omit for non-React adapters (server wallets, CLI).
  Provider?: FC<{ children: ReactNode }>
  // Hook to open the connector's connect/account modals. The `open` / `openAccount` functions are
  // captured by a bridge component inside the bundle's Provider tree.
  useConnectModal?: () => { open: () => void; openAccount?: () => void }
  // Optional read-client factory auto-contributed to the provider's factory registry.
  // Deduped by chainType across all bundles.
  readClientFactory?: ReadClientFactory<unknown>
}
```

The `FC` and `ReactNode` type imports are the only reason `@dappbooster/core` has a compile-time dependency on React types — they are erased at runtime. The runtime React code (`WagmiProvider` composition, the bridge component) lives in the adapter packages, not in core.

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
