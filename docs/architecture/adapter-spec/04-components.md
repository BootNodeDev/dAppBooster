# Component Layer (Style Packages)

> Part of the [dAppBooster adapter architecture spec](../adapter-architecture-spec.md).
> See also: [Provider and Hooks](./03-provider-and-hooks.md), [EVM Adapter](./05-evm-adapter.md)

---

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

This is a **new API** — there is no backwards-compatible `transaction: () => Promise<Hash>` prop. The adapter architecture is a new major version. Consumers migrating from the current codebase adopt the new props; see [Migration Path](./07-migration-and-monorepo.md) for the phased approach.

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
