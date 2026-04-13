# EVM Adapter Implementation and Codegen

> Part of the [dAppBooster adapter architecture spec](../adapter-architecture-spec.md).
> See also: [Adapters](./02-adapters.md), [Provider and Hooks](./03-provider-and-hooks.md)

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
// In @dappbooster/evm-adapter/wagmi — wagmi-coupled part
interface EvmCoreConnectorConfig {
  createConfig: (chains: Chain[], transports: Record<number, Transport>) => WagmiConfig
}

// In @dappbooster/evm-adapter/react — React-specific part (returned by connector factories)
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

Connector adapters live as subpath exports of `@dappbooster/evm-adapter/react/connectors` (React Provider + connect modal hook). They are EVM wallet connection logic, not styling concerns — a Tailwind app uses the same ConnectKit connector as a Chakra app. `EvmCoreConnectorConfig` (wagmi-only, no React) lives in `@dappbooster/evm-adapter/wagmi`.

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
} from '@dappbooster/evm-adapter'

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
import { wrapAdapter } from '@dappbooster/core/utils'

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
