# Component Layer (Style Packages)

> Part of the [dAppBooster adapter architecture spec](../adapter-architecture-spec.md).
> See also: [Provider and Hooks](./03-provider-and-hooks.md), [EVM Adapter](./05-evm-adapter.md)

---

There are two distinct layers here:

1. **Headless components** in `@dappbooster/react/components` — `ConnectWalletButton` and `WalletGuard`. They resolve adapters via hooks and expose render-prop APIs so consumers control the markup.
2. **Styled components** in style packages (`@dappbooster/chakra`, future `@dappbooster/tailwind`, etc.) — thin wrappers around the headless ones (~20-40 lines) that supply the `render` prop with the package's markup. `TransactionButton`, `SignButton`, and styled variants of `ConnectWalletButton` / `WalletGuard` live here.

### Why style packages are separate

The SDK's logic has zero UI dependencies. A consumer using Tailwind doesn't install Chakra. A consumer using Vue doesn't install React. The headless `@dappbooster/react` package stands alone — agents and custom-styled apps consume the headless layer directly.

A Chakra `TransactionButton` and a Tailwind `TransactionButton` call the same `useTransaction()` hook. The only difference is the markup. Building a new style package means writing thin wrappers, not reimplementing logic.

### Headless: ConnectWalletButton

From `@dappbooster/react/components`. Render-prop API — no opinions about markup.

```typescript
interface ConnectWalletButtonProps extends UseWalletOptions {
  render: (props: ConnectWalletButtonRenderProps) => ReactElement
}

interface ConnectWalletButtonRenderProps {
  status: WalletStatus
  truncatedAddress: string | undefined
  onConnect: () => void        // opens the connector's connect modal
  onManageAccount: () => void  // opens the account modal when the connector provides one; otherwise a no-op
}
```

The component resolves a wallet via `useWallet(options)` and delegates every UI decision to `render`. Style packages consume it and supply their own markup.

### Headless: WalletGuard

From `@dappbooster/react/components`. Gates children on wallet readiness — single chain or multi-chain.

```typescript
interface WalletGuardProps {
  // Single-chain form
  chainId?: string | number
  chainType?: string
  // Multi-chain form — pass explicit wallet requirements for bridge-style UX
  require?: WalletRequirement[]
  // Escape hatch — bypass provider resolution in single-chain mode
  adapter?: WalletAdapter
  // Render the "needs connect" state (defaults to an internal ConnectWalletButton)
  renderConnect?: () => ReactElement
  // Render the "wrong chain" state (called with the resolved wallet + the target chainId)
  renderSwitchChain?: (props: SwitchChainRenderProps) => ReactElement
  children?: ReactNode
}

interface WalletRequirement {
  chainId?: string | number
  chainType?: string
}

interface SwitchChainRenderProps {
  wallet: UseWalletReturn
  targetChainId: string | number
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

// Multi-chain gate for a bridge — requires both wallets connected to their respective chains
<WalletGuard require={[{ chainId: 1 }, { chainType: 'svm' }]}>
  <BridgeUI />
</WalletGuard>
```

The guard is binary per requirement: wallet connected on the correct chain? Yes → render children. No → render the appropriate gate (`renderConnect` or `renderSwitchChain`). When either render prop is omitted, a sensible headless default is used — style packages replace these with branded buttons.

A consumer not using a style package builds the same logic inline:

```tsx
function MyGuard({ children }) {
  const { needsConnect, openConnectModal } = useWallet({ chainId: 1 })
  if (needsConnect) return <button onClick={openConnectModal}>Connect</button>
  return children
}
```

### Styled: TransactionButton (Chakra)

Style-package component (`@dappbooster/chakra`). Not a headless primitive — wraps `useWallet` + `useTransaction` and renders a Chakra button with built-in connect/switch-chain gating.

```typescript
interface TransactionButtonProps {
  params: TransactionParams                       // chainId lives inside params (single source of truth)
  lifecycle?: TransactionLifecycle
  fallback?: ReactElement                         // rendered when the wallet is not ready (defaults to a Chakra ConnectWalletButton)
  switchChainLabel?: string                       // prefix used in the switch-chain CTA (defaults to 'Switch to')
  label?: string                                  // default button label when idle
  labelSending?: string                           // label while phase !== 'idle'
  children?: ReactNode
  // + Chakra ButtonProps (variant, size, colorScheme, ...)
}
```

This is a **new API** — there is no backwards-compatible `transaction: () => Promise<Hash>` prop. The adapter architecture is a new major version. Consumers migrating from the current codebase adopt the new props; see [Migration Path](./07-migration-and-monorepo.md) for the phased approach.

Internal structure (~30 lines):

```tsx
function TransactionButton({ params, lifecycle, label, labelSending, fallback, switchChainLabel, ...buttonProps }) {
  const wallet = useWallet({ chainId: params.chainId })
  const tx = useTransaction({ lifecycle })

  if (wallet.needsConnect) {
    return fallback ?? <ConnectWalletButton chainId={params.chainId} />
  }
  if (wallet.needsChainSwitch) {
    return (
      <Button onClick={() => wallet.switchChain(params.chainId)} {...buttonProps}>
        {switchChainLabel ?? 'Switch to'} {wallet.adapter.supportedChains.find(c => c.chainId === params.chainId)?.name}
      </Button>
    )
  }

  return (
    <Button onClick={() => tx.execute(params)} loading={tx.phase !== 'idle'} {...buttonProps}>
      {tx.phase !== 'idle' ? labelSending : label}
    </Button>
  )
}
```

### Styled: SignButton (Chakra)

Style-package component. Wraps `useWallet().signMessage` with the same connect/switch-chain gating pattern.

```typescript
interface SignButtonProps {
  chainId?: string | number
  chainType?: string
  message: string                                 // string payload forwarded to signMessage
  fallback?: ReactElement
  switchChainLabel?: string
  label?: string
  labelSigning?: string
  onSign?: (signature: string) => void
  onError?: (error: Error) => void
  children?: ReactNode
}
```

No transaction adapter needed — this is wallet-only. Errors surface through `onError` and via the wallet lifecycle hooks registered in `DAppBoosterProvider`.

### Styled: ConnectWalletButton (Chakra)

Consumes the headless `ConnectWalletButton` and supplies a Chakra button as the `render` implementation. Adds `label` and `variant`/`size` style props.

```typescript
interface ChakraConnectWalletButtonProps extends UseWalletOptions {
  label?: string  // defaults to 'Connect'
  // + Chakra ButtonProps
}
```

### Styled: WalletGuard (Chakra)

Consumes the headless `WalletGuard` and supplies default Chakra renderers for the connect and switch-chain states. Accepts the same props as the headless version plus Chakra style props.

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

### Component summary

| Component | Layer | Hook(s) used | Purpose |
|---|---|---|---|
| `ConnectWalletButton` | `@dappbooster/react/components` (headless) | `useWallet` | Render-prop button resolving a wallet + modal actions |
| `WalletGuard` | `@dappbooster/react/components` (headless) | `useWallet` / `useMultiWallet` | Gate children on wallet readiness (single- or multi-chain) |
| `TransactionButton` | `@dappbooster/chakra` (styled) | `useWallet` + `useTransaction` | One-click transaction with wallet gating |
| `SignButton` | `@dappbooster/chakra` (styled) | `useWallet` | Message signing with wallet gating |
| `ConnectWalletButton` | `@dappbooster/chakra` (styled) | (wraps headless) | Chakra-styled connect/account button |
| `WalletGuard` | `@dappbooster/chakra` (styled) | (wraps headless) | Chakra-styled gating with default connect/switch UX |
| `ExplorerLink` | (not yet shipped in Chakra) | `useChainRegistry` | Chain-aware explorer links |
| `SwitchChain` | (not yet shipped in Chakra) | `useWallet` + `useChainRegistry` | Chain selector |
| `NotificationToaster` | (app-level, per project) | (lifecycle hooks) | Global transaction/signing notifications |

Consumers using a different style framework (Tailwind, Shadcn, etc.) consume the headless components from `@dappbooster/react/components` and supply their own markup through render props.
