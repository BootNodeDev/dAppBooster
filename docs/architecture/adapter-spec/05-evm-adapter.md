# EVM Adapter Implementation and Codegen

> Part of the [dAppBooster adapter architecture spec](../adapter-architecture-spec.md).
> See also: [Adapters](./02-adapters.md), [Provider and Hooks](./03-provider-and-hooks.md)

---

## 7. EVM Adapter Implementation

The only adapter the SDK ships at launch. It wraps the existing dAppBooster code — no new EVM logic, just formalization behind the adapter interfaces.

### Package layout recap

`@dappbooster/evm-adapter` is a pluggable adapter package with **three dependency layers** — root (viem), `/wagmi` (adds wagmi), `/react` (adds React). The connector factories live as per-library sub-paths under the React layer, so installing one connector library does not bundle the others:

| Sub-path | Layer | Dependencies | Purpose |
|---|---|---|---|
| `@dappbooster/evm-adapter` (root) | root | viem | `createEvmTransactionAdapter`, `createEvmServerWallet`, `fromViemChain`, `evmReadClientFactory`, `createApprovalPreStep`, `createPermitPreStep` — usable in agent scripts, CLI tools, relayers |
| `@dappbooster/evm-adapter/wagmi` | wagmi | wagmi + viem | `createEvmWalletAdapter`, `EvmCoreConnectorConfig` — browser wallet connection without React |
| `@dappbooster/evm-adapter/react` | react | React + wagmi + viem | `createEvmWalletBundle`, `useEvmReadOnly`, `EvmConnectorConfig` — full dApp integration |
| `@dappbooster/evm-adapter/react/connectors/connectkit` | react (sub-path) | React + wagmi + `connectkit` | `createConnectkitConnector` |
| `@dappbooster/evm-adapter/react/connectors/rainbowkit` | react (sub-path) | React + wagmi + `@rainbow-me/rainbowkit` | `createRainbowkitConnector` |
| `@dappbooster/evm-adapter/react/connectors/reown` | react (sub-path) | React + wagmi + `@reown/appkit` | `createReownConnector` |

### EvmWalletAdapter (wagmi layer)

```typescript
function createEvmWalletAdapter(config: EvmWalletConfig): EvmWalletAdapterResult

type EvmWalletAdapterResult = WalletAdapter<'evm'> & { wagmiConfig: Config }

interface EvmWalletConfig {
  coreConnector: EvmCoreConnectorConfig           // produces or receives a wagmi Config
  chains: Chain[]                                 // from viem/chains
  transports: Record<number, Transport>
  wagmiConfig?: Config                            // pre-built wagmi Config — used directly if provided
}
```

Returns the bare `WalletAdapter<'evm'>` implementation plus the underlying `wagmiConfig` so the React-layer bundle factory can mount the right providers. This factory has **no React code** — it is usable in any environment that can run wagmi (browser, test, non-React UI frameworks).

### EvmWalletBundle (react layer)

```typescript
function createEvmWalletBundle(config: EvmWalletBundleConfig): WalletAdapterBundle

interface EvmWalletBundleConfig {
  connector: EvmConnectorConfig                   // React + wagmi connector (from /react/connectors)
  chains: Chain[]
  transports: Record<number, Transport>
  wagmiConfig?: Config                            // optional pre-built Config (shared with generated hooks)
}
```

Calls `createEvmWalletAdapter` internally, then wraps the result with `WagmiProvider` + `QueryClientProvider` + the connector's `WalletProvider`, and auto-contributes `evmReadClientFactory`. The returned `WalletAdapterBundle` is what consumers pass to `DAppBoosterProvider.wallets.evm`.

### EvmConnectorConfig is split across layers

```typescript
// In @dappbooster/evm-adapter/wagmi — wagmi-coupled only, no React types
interface EvmCoreConnectorConfig {
  createConfig: (chains: Chain[], transports: Record<number, Transport>) => WagmiConfig
}

// In @dappbooster/evm-adapter/react — adds the React Provider and modal hook
interface EvmConnectorConfig extends EvmCoreConnectorConfig {
  WalletProvider: FC<{ children: ReactNode }>       // ConnectKitProvider, RainbowKitProvider, etc.
  useConnectModal: () => { open: () => void; openAccount?: () => void }
}

// App metadata accepted by every connector factory — decouples connectors from env variables.
interface ConnectorAppMetadata {
  appName: string
  appDescription?: string
  appUrl?: string
  appIcon?: string
  walletConnectProjectId: string
}
```

Non-React consumers (CLI, agents, relayers) use `createEvmServerWallet()` (root layer) and never touch `EvmConnectorConfig`. They build a wagmi-less transaction flow without ever loading a connector.

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

Connector adapters live as subpath exports of `@dappbooster/evm-adapter/react/connectors` (React Provider + connect modal hook). They are EVM wallet connection logic, not styling concerns — a Tailwind app uses the same ConnectKit connector as a Chakra app. `EvmCoreConnectorConfig` (wagmi-only, no React) lives in `@dappbooster/evm-adapter/wagmi`.

### EvmServerWallet (root layer)

```typescript
function createEvmServerWallet(config: EvmServerWalletConfig): WalletAdapterBundle

interface EvmServerWalletConfig {
  privateKey: Hex              // 0x-prefixed 32-byte hex
  chain: Chain                 // required — the chain this wallet operates on
  transport?: Transport        // defaults to http() against the chain's default RPC
}
```

Viem-only server wallet. `connect()` and `disconnect()` are no-ops — the wallet is always connected via the supplied private key. `getSigner()` returns a viem `WalletClient`. Used by agent scripts, CLI tools, relayers, and any Node.js context where there is no browser, no React, and no user interaction.

### EvmTransactionAdapter (root layer)

```typescript
function createEvmTransactionAdapter(config: EvmTransactionConfig): TransactionAdapter<'evm'>

interface EvmTransactionConfig {
  chains: Chain[]                          // from viem/chains — adapter validates chainId against this
  transports: Record<number, Transport>    // one transport per chainId
}
```

Both `chains` and `transports` are required — the adapter must be able to build a read client and validate `params.chainId` against `supportedChains`. `@precondition chains.length >= 1` is enforced at runtime (throws on violation).

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

`pnpm codegen` (the orchestrator from Phase 4 — `pnpm wagmi-generate` is kept as a migration alias) still produces typed hooks for specific contracts (`useReadWethAllowance`, `useWriteWethApprove`, etc.). These are EVM-specific convenience hooks with full type safety.

They coexist with the adapter. A developer building an EVM-only app may prefer generated hooks for their type safety and skip the adapter for common contract interactions. The adapter is for the generic, chain-agnostic path.

### EVM PreStep helpers

The SDK ships convenience functions for common PreStep patterns. These are the **only way** to build PreSteps for EVM transactions — agents and developers use these, not manual PreStep construction.

```typescript
import {
  createApprovalPreStep,
  createPermitPreStep,
} from '@dappbooster/evm-adapter'

// ERC-20 approval before a swap/transfer/deposit
const approvalStep = createApprovalPreStep({
  token: usdcAddress,                       // ERC-20 token to approve
  spender: routerAddress,                   // contract that will spend the token
  amount: parseUnits('1000', 6),
  chainId: 1,                               // required — chain the approval will run on
})
// Returns: PreStep { label: 'Approve <token>', params: { chainId, payload: { contract: approve call } } }
// The EVM adapter's prepare() checks current allowance — if already sufficient, the preStep is skipped.

// EIP-2612 permit — submits a permit() transaction using a previously-collected (v, r, s) signature.
// Producing the signature is consumer-side (use useWallet().signTypedData() with the EIP-712 domain
// and Permit type, then pass v/r/s into createPermitPreStep). This factory does NOT call signTypedData
// for you; it builds the on-chain permit() transaction PreStep.
const permitStep = createPermitPreStep({
  token: usdcAddress,
  owner: userAddress,
  spender: routerAddress,
  value: parseUnits('1000', 6),
  deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
  v, r, s,                                  // from a prior signTypedData call
  chainId: 1,
})
// Returns: PreStep wrapping an EvmContractCall for the token's permit() function.

// Usage with useTransaction:
const tx = useTransaction({ lifecycle: { onConfirm: () => invalidateQueries() } })

// autoPreSteps defaults to true — approval runs automatically before the swap:
await tx.execute({
  chainId: 1,
  payload: swapPayload,
  preSteps: [approvalStep],
})

// Per-step approval UX (autoPreSteps: false) — gate execute() until each preStep completes.
const stepwise = useTransaction({ autoPreSteps: false })
await stepwise.executePreStep(0)            // run only the first preStep
await stepwise.executeAllPreSteps()         // run any remaining preSteps
await stepwise.execute({ chainId: 1, payload: swapPayload, preSteps: [approvalStep] })
```

Additional helpers to be added as common patterns emerge:
- `createWrapEthPreStep()` — wrap ETH → WETH before operations requiring ERC-20
- `createUnwrapEthPreStep()` — unwrap WETH → ETH after operations

### Adapter wrapping utility

The SDK provides `wrapAdapter()` for composing adapters — adding observation AND transformation hooks around every method call without implementing a full adapter from scratch. This is the formal mechanism for patterns like logging, analytics, error monitoring, encryption middleware, and result post-processing.

```typescript
import { wrapAdapter } from '@dappbooster/core/utils'

interface WrapAdapterHooks {
  // Transform: runs first. Replaces the args array passed to the method.
  // Errors thrown here propagate (NOT fire-and-forget) and abort the call.
  beforeCall?(method: string, args: unknown[]): unknown[]
  // Observation: runs after beforeCall, before the method. Errors are swallowed.
  onBefore?(method: string, args: unknown[]): void
  // Observation: runs after the method returns successfully. Errors are swallowed.
  onAfter?(method: string, result: unknown): void
  // Observation: runs when the method throws or rejects. Errors are swallowed.
  onError?(method: string, error: Error): void
  // Transform: runs after onAfter. Replaces the resolved value.
  // Errors thrown here propagate and abort the call.
  afterCall?(method: string, result: unknown): unknown
}

function wrapAdapter<T extends object>(adapter: T, hooks: WrapAdapterHooks): T
// Execution order: beforeCall -> onBefore -> method -> onAfter -> afterCall
// (onError fires when the method throws; beforeCall/afterCall errors propagate immediately.)

// Example: logging middleware (observation-only)
const loggingAdapter = wrapAdapter(evmTransactionAdapter, {
  onBefore: (method, args) => console.log(`[${method}] called with`, args),
  onAfter: (method, result) => console.log(`[${method}] returned`, result),
  onError: (method, error) => console.error(`[${method}] threw`, error),
})

// Example: analytics (observation-only)
const trackedAdapter = wrapAdapter(evmWalletAdapter, {
  onAfter: (method, result) => {
    if (method === 'connect') analytics.track('wallet_connected', result)
    if (method === 'signMessage') analytics.track('message_signed')
  },
})

// Example: FHE-style transform — encrypt arguments before they hit the chain, decrypt the result.
const encryptedAdapter = wrapAdapter(evmTransactionAdapter, {
  beforeCall: (method, args) => method === 'execute' ? [encryptParams(args[0]), args[1]] : args,
  afterCall: (method, result) => method === 'confirm' ? decryptReceipt(result) : result,
})
```

`wrapAdapter` works on any object — wallet adapters, transaction adapters, or any other interface. It wraps inherited methods via prototype traversal and preserves synchronous vs asynchronous behavior.

### What doesn't change

- wagmi is the EVM engine under the hood — the adapter wraps it, doesn't replace it
- viem types (`Address`, `Hash`, `Hex`, `Abi`) are used inside the EVM adapter
- The wagmi-cli codegen still works for EVM-specific type generation
- Existing EVM patterns (generated hooks, Suspense reads) continue to work

### EVM library coupling (explicit constraint)

The adapter interfaces (`WalletAdapter`, `TransactionAdapter`) are library-agnostic — they define contracts in terms of generic types (`ChainSigner`, `TransactionParams`, `TransactionRef`). However, the shipped EVM implementation is **structurally coupled to wagmi + viem** at three levels:

1. **Connector system** — `EvmCoreConnectorConfig.createConfig()` returns wagmi's `Config` type. `EvmConnectorConfig.WalletProvider` wraps `WagmiProvider` + `QueryClientProvider`. All three shipped connectors (ConnectKit, RainbowKit, Reown) are wagmi-based.

2. **Adapter internals** — `createEvmWalletAdapter` uses `@wagmi/core` actions (`connect`, `disconnect`, `signMessage`, `getWalletClient`, `watchAccount`, `switchChain`). `createEvmTransactionAdapter` uses viem's `PublicClient` and `WalletClient`. The `ChainSigner` opaque type is a viem `WalletClient` at runtime.

3. **Generated contract hooks** — `pnpm codegen` invokes the EVM codegen plugin, which delegates to `@wagmi/cli`. The output imports a wagmi `Config` instance and uses `wagmi/codegen` + `@tanstack/react-query`. These hooks are tightly bound to wagmi's query/cache infrastructure.

**What this means for alternative libraries:**

- **Replacing wagmi with ethers.js for EVM** is not a config swap. It requires a parallel `WalletAdapter<'evm'>` + `TransactionAdapter<'evm'>` implementation, a replacement for the connector system (no `WagmiProvider`), and either dropping generated hooks or building an ethers-based codegen. The practical investment is equivalent to writing a new chain adapter from scratch.

- **Adding non-EVM chains** (SVM, Cosmos, etc.) is the designed extension point. Each chain type gets its own adapter implementations that use whatever library is native to that ecosystem (e.g., `@solana/web3.js` for SVM, `@cosmjs` for Cosmos). These coexist with the EVM adapter — the architecture supports multiple chain types, not multiple libraries for the same chain type.

- **The adapter interface is the stable contract.** If a future EVM library emerges that's superior to wagmi/viem, the migration path is: implement new `WalletAdapter<'evm'>` + `TransactionAdapter<'evm'>`, register them in `DAppBoosterConfig`, and all hook/component consumers work unchanged. The interface boundary protects consumers from implementation churn.

---

## 8. Codegen Orchestrator

The historical `pnpm wagmi-generate` was EVM-specific. Phase 4 replaced it with `pnpm codegen` — a generic orchestrator that discovers and runs adapter codegen plugins. `pnpm wagmi-generate` is kept as an alias during migration.

### CodegenPlugin contract

Every adapter that participates in codegen exports a default `CodegenPlugin`:

```typescript
interface CodegenResult {
  files: string[]                         // generated file paths (relative to project root)
  warnings?: string[]                     // non-fatal issues to surface
}

interface CodegenPlugin {
  name: string                            // human-readable identifier (e.g., 'evm-wagmi')
  run(): Promise<CodegenResult>
}
```

### Plugin discovery

The orchestrator (`scripts/codegen.ts`) discovers plugins from two sources:

1. **Local convention** — scans `src/sdk/<adapter>/codegen/index.ts`. Each file whose default export looks like a `CodegenPlugin` is loaded. Used during monorepo development and for adapters not yet extracted to packages.
2. **Installed packages** — scans `node_modules/@dappbooster/*/package.json` for a `"dappbooster": { "codegen": "<path>" }` field. The path is resolved relative to the package and its default export is loaded.

There is **no `dappbooster.config.ts` file**. Discovery is convention-based and the orchestrator runs every plugin it finds, sequentially, with per-plugin error isolation (one failing plugin does not block the others).

### EVM codegen plugin

The EVM adapter ships its plugin at `src/sdk/evm-adapter/codegen/index.ts` (will become `@dappbooster/evm-adapter` published codegen entry):

```typescript
import { execSync } from 'node:child_process'
import type { CodegenPlugin } from '@dappbooster/codegen'

const evmCodegenPlugin: CodegenPlugin = {
  name: 'evm-wagmi',
  async run() {
    execSync('pnpm wagmi generate --config src/contracts/wagmi/config.ts', { stdio: 'pipe' })
    return { files: ['src/contracts/generated.ts'] }
  },
}

export default evmCodegenPlugin
```

It wraps `@wagmi/cli`, which is configured to emit Suspense-friendly React hooks via the `reactSuspenseRead` plugin alongside the default `react()` plugin. Framework-agnostic actions (wagmi-cli's `actions` plugin) can be added to the same wagmi config when consumers need them — the orchestrator does not change.

### Why this design

- **Adapter-author convenience** — a new adapter package adds one file (`codegen/index.ts`) and one `package.json` field. No central registry to update.
- **No codegen config to maintain** — the orchestrator always runs everything it discovers. Consumers turn off codegen by removing the adapter package, not by editing config.
- **Per-plugin error isolation** — a broken EVM codegen plugin does not stop an SVM plugin from running. The orchestrator reports per-plugin status and exits non-zero if any failed.
- **Framework-agnostic by default** — non-EVM adapters (SVM Anchor IDL, Cosmos Telescope, etc.) already emit framework-agnostic typed clients. Their plugins fit this contract trivially.

### Codegen is optional

Even without generated code, viem provides typed contract interaction:

```typescript
// Framework-agnostic — works in CLI, agent, relayer, anywhere
import { getContract } from 'viem'
const contract = getContract({ address, abi, client: publicClient })
await contract.read.balanceOf([address])
await contract.write.transfer([to, amount])
```

Codegen is a DX convenience for type safety against specific contracts, not a requirement. The adapter's `execute()` accepts raw payloads (ABI + function name + args) and works without generated code.
