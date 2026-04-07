# dAppBooster Domain Folder Architecture

## What changed

The `src/` directory has been reorganized from a flat, role-based structure (`components/`, `hooks/`, `utils/`, `providers/`) into domain-based folders where each folder owns everything related to one concern.

### Before

```
src/
  components/sharedComponents/    # all shared components mixed together
  hooks/                          # all hooks mixed together
  utils/                          # all utilities mixed together
  providers/                      # all providers mixed together
  types/                          # all types mixed together
```

### After

```
src/
  core/           # shared UI primitives, utilities, types
  wallet/         # wallet connection, chain switching, status
  transactions/   # TransactionButton, SignButton, notifications
  tokens/         # token lists, balances, TokenSelect, TokenInput
  contracts/      # ABIs, contract definitions, wagmi codegen
  data/           # subgraph queries, indexer adapters
  components/     # page-level components (routes, demos)
  routes/         # TanStack Router route definitions
```

Each domain folder has **sub-barrel entry points** that define its public API:

```
src/wallet/
  components.ts   → WalletStatusVerifier, SwitchNetwork, ConnectButton, ...
  hooks.ts        → useWalletStatus, useWeb3Status
  providers.ts    → Web3Provider
  types.ts        → ChainsIds, chains, ...
  components/     # implementation files
  hooks/          # implementation files
  providers/      # implementation files
  connectors/     # wallet connector configs
```

## How imports work

Consumers import from sub-barrels, never from implementation files directly:

```typescript
// Good — imports from the domain's public API
import { WalletStatusVerifier, useWeb3StatusConnected } from '@/src/wallet/components'
import { useWalletStatus } from '@/src/wallet/hooks'
import { TransactionButton } from '@/src/transactions/components'
import { PrimaryButton, Spinner } from '@/src/core/components'
import { withSuspenseAndRetry } from '@/src/core/utils'
import type { Token } from '@/src/tokens/types'

// Bad — reaches into implementation details
import { useWalletStatus } from '@/src/wallet/hooks/useWalletStatus'
import { PrimaryButton } from '@/src/core/ui/PrimaryButton/index'
```

This follows a **Design by Contract** principle: each domain exposes a defined interface. Implementation details can change freely without breaking consumers.

## Why this matters

### Tree-shaking

Sub-barrels (`components.ts`, `hooks.ts`, `utils.ts`) are separate entry points, not one giant `index.ts` that re-exports everything. When you import `{ useWalletStatus }` from `@/src/wallet/hooks`, the bundler only pulls in wallet hooks — not wallet components, providers, or connectors. This keeps production bundles lean.

### Discoverability

A new developer (or an AI agent) can look at `src/wallet/components.ts` and immediately see every component the wallet domain exposes. No need to grep through dozens of files. The barrel is the documentation.

### Isolation

Each domain is self-contained. `tokens/` doesn't import from `wallet/` internals. `transactions/` doesn't reach into `core/ui/`. If a domain needs something from another domain, it imports from the sub-barrel — making cross-domain dependencies explicit and auditable.

### Testability

Moving related code together means tests live next to what they test. `WalletStatusVerifier.test.tsx` lives in `wallet/components/`, not in a separate `__tests__/` tree. This makes it obvious what's tested and what isn't.

## WalletStatusVerifier context pattern

As part of this restructuring, `WalletStatusVerifier` was upgraded from a simple wrapper to a **context provider**:

- `WalletStatusVerifier` provides a React Context with connected wallet data when verification passes
- `useWeb3StatusConnected()` reads from that context — if called outside the tree, it throws a `DeveloperError` with an actionable message
- Error boundaries detect `DeveloperError` and show the message **without** a "Try Again" button (structural errors can't be fixed by retrying)
- `useOPL1CrossDomainMessengerProxy` accepts `walletAddress` as a parameter instead of fetching it internally, making it portable and testable

This enforces a single pattern: components that need a connected wallet **must** be inside `<WalletStatusVerifier>`. The error message tells you exactly what to do if you forget.

## What's next

### `#wallet` connector alias (Task 2)

Currently, switching wallet connectors (ConnectKit, RainbowKit, Reown) requires editing source code. The next step adds a Vite alias so the connector is selected via an environment variable:

```bash
# .env.local
PUBLIC_WALLET_CONNECTOR=connectkit   # or rainbowkit, reown
```

Each connector exports the same interface (`WalletProvider`, `ConnectWalletButton`, `createWalletConfig`). The app imports from `#wallet`, and Vite resolves it to the right connector at build time. Zero code changes to switch.

### Package extraction (Task 3)

The sub-barrel structure is designed to map directly to `package.json` `exports` entries. Each domain folder becomes an independently publishable package:

```
@dappbooster/core       → src/core/
@dappbooster/wallet     → src/wallet/
@dappbooster/tokens     → src/tokens/
@dappbooster/transactions → src/transactions/
```

Consumers install only what they need. The sub-barrels we have today become the package entry points — no restructuring needed, just packaging.

Before extraction, remaining cross-domain dependency violations (e.g., `core/` importing from `wallet/` in Header and NotificationToast) need to be resolved by moving those components to an app shell layer.
