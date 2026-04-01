# dAppBooster

A repository template / starter-kit for building decentralized applications (dApps). Built by BootNode based on 5+ years of dApp development. Docs: https://docs.dappbooster.dev/ Components: https://components.dappbooster.dev/

System architecture, data flow, provider hierarchy, and structural conventions are documented in [architecture.md](./architecture.md). Read it when working on tasks that involve the system's structure or patterns.

## Requirements

- Node 24+ (see `.nvmrc`)
- pnpm 10.30.2+ (enforced via `packageManager` in package.json; corepack will block npm/yarn)

## Setup

1. `pnpm install` (postinstall automatically runs `pnpm wagmi-generate`)
2. `cp .env.example .env.local`
3. Edit `.env.local`:
   - `PUBLIC_APP_NAME` is mandatory
   - `PUBLIC_WALLETCONNECT_PROJECT_ID` is needed for wallet connection to work
   - RPC vars (`PUBLIC_RPC_*`) are optional -- wagmi falls back to default public RPCs
   - Subgraph vars are all-or-nothing: if ANY `PUBLIC_SUBGRAPHS_*` var is missing or empty, codegen will skip and the app will crash at runtime. Either set them all or remove all subgraph-related code.
4. `pnpm subgraph-codegen` (only if subgraph vars are configured)
5. `pnpm dev`

## Git Hooks (Husky)

Three hooks run automatically and will block on failure:

- **pre-commit:** lint-staged runs Biome check + Vitest on related files for staged changes
- **commit-msg:** commitlint enforces conventional commit format. Valid types: `feat`, `fix`, `docs`, `test`, `ci`, `refactor`, `perf`, `chore`, `revert`, `style`, `build`, `wip`, `release`. PR titles are also validated via CI.
- **pre-push:** full `tsc --noEmit` type check (pushes with type errors will be rejected)

## Commit Standards

Use [Conventional Commits](https://www.conventionalcommits.org/):

**Format:** `type(scope): subject`

- **Scope** is optional: `feat: add login` and `feat(auth): add login` are both valid
- **Subject** uses imperative mood, lowercase after the colon, no trailing period
- **Body** (optional): separated by a blank line, explains *what* and *why*

**Prefixes:**

| Prefix | Purpose |
|--------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, dependencies, config |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `style` | Formatting, whitespace, semicolons |
| `ci` | CI/CD pipeline changes |
| `perf` | Performance improvement |
| `build` | Build system or external dependencies |
| `revert` | Reverts a previous commit |
| `wip` | Work in progress (avoid on main) |
| `release` | Release-related changes |

## PR Workflow

- Every PR must reference an issue (`Closes #N`)
- Mirror the issue's acceptance criteria in the PR
- Self-review your diff before requesting peer review
- Keep PRs small and focused -- one issue, one PR
- PR titles use the same conventional commit format (`feat: add user dashboard`)

## Label Conventions

GitHub form dropdowns (like the Severity field in `1-bug.yml`) only work through the web UI. When issues are created via `gh` CLI or REST API, dropdown values become unstructured body text -- not queryable, not consistent. **Labels are the API-reliable mechanism for structured metadata.**

**Severity** (bugs only):

| Label | Description |
|-------|-------------|
| `severity: critical` | System down, data loss, or security issue |
| `severity: high` | Broken feature, no workaround |
| `severity: medium` | Broken feature, workaround exists |
| `severity: low` | Cosmetic or minor inconvenience |

**Priority** (features and epics):

| Label | Description |
|-------|-------------|
| `priority: high` | Must be addressed in current sprint |
| `priority: medium` | Should be addressed soon |
| `priority: low` | Nice to have, can wait |

Labels are queryable: `gh issue list --label "severity: high"`, `gh issue list --label "priority: medium"`.

The `/issue` skill applies these labels automatically when creating issues via CLI. The bug template's severity dropdown is kept for web UI users but is not the source of truth for programmatic workflows.

## Code Style

- **No semicolons** in TypeScript/JavaScript
- **Single quotes**
- 2-space indentation, 100 char line width
- Import organization handled by Biome
- Path aliases: `@/src/*` and `@packageJSON`
- All env vars prefixed with `PUBLIC_` and validated in `src/env.ts`
- JSDoc comments on exported functions/components (follow existing patterns)

## Styling

- **Chakra UI props** are the primary styling method. No CSS modules, no Tailwind, no styled-components.
- Theme is defined in `src/components/ui/provider.tsx` using `createSystem` extending `defaultConfig`.
- Use **semantic tokens** for colors: `bg`, `primary`, `text`, `danger`, `ok`, `warning`. These support light/dark mode. Do not hardcode color values.
- Fonts: Manrope (body/heading), Roboto Mono (mono/code).
- Complex components export style objects from a `styles.ts` file, consumed via Chakra's `css` prop or spread into component props.

## Component Conventions

- **Simple components:** single file (e.g., `ExplorerLink.tsx`, `SwitchNetwork.tsx`)
- **Complex components:** folder with:
  - `index.tsx` -- main component and public API
  - `Components.tsx` -- sub-components (styled primitives, layout pieces)
  - `styles.ts` -- style objects
  - `useComponentName.ts` -- dedicated hook (optional)
- Page components go in `src/components/pageComponents/<pagename>/`
- Shared/reusable components go in `src/components/sharedComponents/`

## Key Patterns

### Adding a New Contract

1. Save ABI in `src/constants/contracts/abis/YourContract.ts` (export as const)
2. Register in `src/constants/contracts/contracts.ts` with name, ABI, and addresses per chain
3. Run `pnpm wagmi-generate` to auto-generate typed hooks in `src/hooks/generated.ts`

The contracts array uses `as const satisfies ContractConfig<Abi>[]` for full type inference. Follow this pattern.

Use `getContract(name, chainId)` to retrieve a typed contract config at runtime (e.g., `getContract('WETH', sepolia.id)` returns `{ abi, address }`).

### Adding a New Route/Page

1. Create route file in `src/routes/` using `.lazy.tsx` extension for code-split lazy loading (e.g., `yourpage.lazy.tsx`). Use plain `.tsx` only for routes that must be eagerly loaded.
2. Create page component in `src/components/pageComponents/yourpage/`
3. Route tree auto-generates via TanStack Router plugin

### Adding a New Network

1. Import chain from `viem/chains` in `src/lib/networks.config.ts`
2. Add to the appropriate chain array (devChains or prodChains)
3. Add transport entry with optional custom RPC from env
4. Add RPC env var to `src/env.ts` if needed

### Environment Variables

- Defined and validated with Zod in `src/env.ts`
- Access via `import { env } from '@/src/env'` (never `import.meta.env` directly)
- New variables MUST be added to both `.env.example` and `src/env.ts`

## Auto-Generated Files (Do Not Edit, Do Not Commit)

These files are gitignored and regenerated from source:

- `src/hooks/generated.ts` -- regenerate with `pnpm wagmi-generate`
- `src/routeTree.gen.ts` -- regenerate with `pnpm routes:generate`
- `src/subgraphs/gql/` -- regenerate with `pnpm subgraph-codegen`

## Testing

- Framework: Vitest with jsdom environment
- Test files: colocated as `*.test.ts` / `*.test.tsx`
- Mocking: `vi.mock()` for module mocks
- Component testing: Testing Library + jest-dom matchers
- Run: `pnpm test` (single run) or `pnpm test:watch`
- **What to test:** Business logic, API integrations, component behavior
- **What not to test:** Styling, third-party library internals, trivial getters/setters
- **Coverage:** Aim for meaningful coverage, not a number. Cover the paths that matter.

## Guardrails

- Do not commit secrets, API keys, or credentials
- Do not modify CI/CD pipelines without team review
- Do not skip tests or linting to make a build pass
- When in doubt, ask -- don't assume

## Change Strategy

- Prefer small, focused diffs over broad refactors
- Preserve existing UX unless the task explicitly changes it
- Avoid introducing new patterns when a project pattern already exists
- Update docs only when behavior or workflow changes

## Validation Checklist

Run before declaring work done:

- `pnpm lint`
- `pnpm test`
- `pnpm build` (when feasible for runtime-impacting changes)

## References

- [dAppBooster Docs](https://docs.dappbooster.dev/)
- [Component Library](https://components.dappbooster.dev/)
