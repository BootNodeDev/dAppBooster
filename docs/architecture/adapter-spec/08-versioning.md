# Versioning Policy

> Part of the [dAppBooster adapter architecture spec](../adapter-architecture-spec.md).
> See also: [Adapters](./02-adapters.md), [Migration and Monorepo](./07-migration-and-monorepo.md), [CONTRIBUTING.md](../../../CONTRIBUTING.md)

---

## Why this document exists

dAppBooster ships multiple packages — `@dappbooster/core`, `@dappbooster/evm-adapter`, `@dappbooster/react`, `@dappbooster/chakra` — and accepts in-house and (rarely) third-party adapter packages on top. Without an explicit policy, every `package.json` bump is a judgment call: is this minor or major? Is renaming a sub-path breaking? Can we change a lifecycle hook key in a patch?

This policy answers those questions once, in writing. Adapter authors and consumers should be able to predict the impact of any release without reading the diff.

---

## Public surface

The contract is **medium**: stable enough to plan around, narrow enough to leave room for the SDK to evolve.

### Committed surface (changes here require a major bump)

- **Exported symbols** documented with JSDoc — functions, classes, interfaces, types, constants.
- **Error class names** — every class extending `Error` thrown by the SDK. Consumers `catch (e instanceof X)` against these.
- **Lifecycle hook keys** — `onPrepare`, `onSubmit`, `onConfirm`, `onError`, `onReplace`, `onSign`, `onSignComplete`, `onSignError`, `onPreStep`, `onPreStepComplete`. The keys themselves, not the implementation behind them.

### Evolving surface (changes here ship with deprecation, not a major bump)

- **Sub-path import paths** — `@dappbooster/evm-adapter/wagmi`, `@dappbooster/react/hooks`, and so on. Renaming a sub-path during stable triggers a deprecation window (see below); during beta, sub-paths can change between releases with notes.
- **The `dappbooster.codegen` package.json field convention** — the shape of the field that adapter packages declare for plugin discovery. Same deprecation rules as sub-paths. How the orchestrator trusts and gates plugins declared via this field is covered by the [codegen trust & enablement model](./07-migration-and-monorepo.md#codegen-trust--enablement-model); Zod-schema validation of the field is a Phase 5 deliverable.

### Internal (no guarantee)

- Anything not exported. File layout, internal helpers, refs, module-private state.
- Build outputs, source maps, dist file names.
- Test utilities (unless explicitly exported under a `/testing` sub-path one day).

---

## Compatibility model

Each package follows semver independently. Cross-package compatibility is declared in `peerDependencies` ranges:

- An adapter package (e.g. `@dappbooster/evm-adapter`) declares a compatibility range against `@dappbooster/core`. When core bumps a major, the adapter's range must be updated and the adapter bumps a major.
- `@dappbooster/react` declares a compatibility range against `@dappbooster/core`. Same rule.
- `@dappbooster/chakra` declares a compatibility range against `@dappbooster/react`. Same rule.

The benefit: core can bump majors without forcing every consumer to update simultaneously. A consumer staying on `@dappbooster/core@2` keeps working with `@dappbooster/evm-adapter@2`; they upgrade both packages together when they're ready.

The cost: more coordination at release time when a core major lands. Changesets carry the mechanism — see below.

---

## Deprecation policy

Two tiers, matching the release status of the package.

### During beta or alpha (e.g. `3.0.0-beta.x`, `3.0.0-rc.x`)

No formal deprecation window. Breaking changes can ship in any beta release with migration notes attached to the release. The contract with consumers is "expect churn, follow the release notes."

### Once a package has shipped its first stable major (e.g. `3.0.0`+)

- A member is marked `@deprecated` in a minor release.
- A deprecated member must live in **at least one** minor release before removal.
- Removal happens in the next major.

Effective window: from deprecation to the next major bump. That depends on the major cadence — typically months, not weeks.

### How a deprecation surfaces

- JSDoc `@deprecated` tag with a one-line replacement hint.
- In development builds, the first call to a deprecated member logs a `console.warn` once per process, naming the replacement.
- The warning is stripped from production builds (no runtime cost for end users).

---

## What counts as what

### Major (breaking)

- Removing or renaming any exported symbol.
- Removing or renaming any field on an exported type or interface.
- Tightening an exported function's input type, or loosening its return type, in a way that could break existing call sites.
- Renaming, removing, or restructuring a sub-path declared in `exports`.
- Removing or renaming a lifecycle hook key.
- Removing or renaming an error class.
- Changing the shape of the `dappbooster.codegen` field convention.
- Tightening a `peerDependencies` range in a way that excludes previously-compatible versions.

### Minor (non-breaking, additive)

- Adding a new exported symbol.
- Adding an optional field to an exported type or interface.
- Adding a new sub-path under `exports`.
- Adding a new lifecycle hook key (with a sensible no-op default).
- Adding a new error class.
- Widening a `peerDependencies` range to accept newer compatible versions.
- Marking an existing symbol `@deprecated` (the marker is informational; the symbol still works).

### Patch (bug fix)

- Fixing a bug without changing exported types or runtime behavior consumers depend on.
- Documentation-only changes (JSDoc on existing exports, README updates).
- Internal refactors with no observable effect.
- Dependency updates that don't touch the public API.

---

## Enforcement

Most of the contract is mechanically checkable. The remaining slice (behavioral changes that don't surface in types) needs human review — same as any project. The enforcement stack:

### Mechanically enforced

- **Exported symbols, type signatures, lifecycle hook keys, error class names, JSDoc `@deprecated` and `@throws` annotations** — checked by [API Extractor](https://api-extractor.com/). Each package emits a `.api.md` snapshot of its public surface, committed to git. Any PR that changes the surface also updates the snapshot; reviewers see the diff. CI fails when the snapshot is stale (author forgot to regenerate it).
- **Sub-path import paths** — a CI script diffs the `exports` field in every package's `package.json` between the PR base and head; flags any removed or renamed sub-path.
- **The `dappbooster.codegen` field convention** — defined as a Zod schema in `@dappbooster/codegen`. Adapter packages validate their own `package.json` at build time. Schema changes are themselves versioned: changing the schema is a breaking change to the convention.

### Behavioral conformance via a shared test suite

Static surface tells you that `WalletAdapter.connect()` exists and has the right signature. It doesn't tell you that the implementation **actually throws `WalletConnectionRejectedError` when the user rejects** or that lifecycle hooks fire in the documented order. Those are behavioral contracts, and they live in code, not in `.d.ts` files.

`@dappbooster/core/testing` ships a conformance suite — a set of tests that any `WalletAdapter` or `TransactionAdapter` implementation must pass. Each adapter package imports the suite and runs it against its own factory:

```ts
import { runWalletAdapterConformance } from '@dappbooster/core/testing'

runWalletAdapterConformance({
  createAdapter: () => createEvmWalletAdapter({ /* config */ }),
  expectedChainType: 'evm',
})
```

The suite asserts every behavioral claim from the JSDoc contracts: which errors are thrown when, the order lifecycle hooks fire in, the shape of return values, that observation hooks swallow errors while transformation hooks propagate them, that `connect()` followed by `disconnect()` returns to the documented initial state, and so on.

Three benefits:

1. **The contract IS the test code.** The JSDoc says "throws X when Y"; the conformance suite asserts exactly that. The two cannot drift.
2. **Every adapter inherits the contract automatically.** Write the suite once; every chain type benefits.
3. **External adapter authors get a free quality bar.** Their tests pass = their adapter conforms.

When the suite's assertions change, it's a contract change — same rules as any other public-surface change. Tightening a conformance check (now asserts something previously unchecked) is non-breaking for adapters that already comply; loosening it or removing a check is non-breaking too. Removing a previously-asserted guarantee is the breaking move and bumps a major.

### Cross-checked against Changesets

When API Extractor sees a removed export but the changeset is `patch` or `minor`, CI fails with "this looks like a major bump." The two systems together — mechanical surface diff + human-declared intent — catch mismatches before merge.

### Human review required

- Behavioral changes that don't appear in types: a function that used to throw on null now returns null silently, an invariant that used to hold no longer does, an internal optimization that changes observable timing.
- JSDoc prose changes (the `@deprecated` tag is mechanical; the explanation text in JSDoc body is not).

Tests catch some of this. The rest is the reviewer's job.

### Status

The mechanical pieces (API Extractor, exports-diff, codegen Zod schema) land alongside monorepo extraction (Phase 5+) — API Extractor needs published-package layouts to be useful, and configuring it against the pre-extraction `src/sdk/<package>/index.ts` paths would require redoing the configs once packages move.

The conformance suite is best built **with the second adapter in hand** (Canton or similar) — building it against the EVM adapter alone risks baking EVM-specific assumptions into the supposedly chain-agnostic contract. Phase 5 alongside Canton is the natural moment.

Until both land, enforcement is reviewer-driven. The contract above is the checklist; the absence of tooling is the gap. See the local `FOLLOWUPS.md` for the planned tooling tasks.

---

## Changesets workflow

We use [Changesets](https://github.com/changesets/changesets) to track per-package version bumps:

- A changeset is a small markdown file describing one logical change and the packages it affects.
- Every PR that touches a published package adds a changeset.
- A PR touching multiple packages adds multiple changesets — one per package, each with its own bump level.
- Release time aggregates the pending changesets into version bumps and changelog entries.

The mechanics of running Changesets (commands, CI integration, release automation) are documented separately during monorepo extraction. This policy commits to the workflow shape; the implementation guide arrives with the tooling.

---

## External contributors

If you're contributing an adapter or other code from outside BootNode, read [CONTRIBUTING.md](../../../CONTRIBUTING.md) first. It explains:

- What we guarantee stable versus what may evolve.
- How to coordinate adapter work before starting (avoids API churn surprises).
- Which communication channels carry change notifications.
