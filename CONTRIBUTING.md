# Contributing to dAppBooster

Most adapters and SDK code are built in-house. External contributions are welcome but rare — this document captures the expectations on both sides so a contribution doesn't get stuck waiting on context.

If you're fixing a typo or filing a bug, skip to the [Quick reference](#quick-reference) at the bottom. If you're proposing an adapter or a substantive feature, read on.

---

## Open a discussion before you start

For anything beyond a small fix, open a GitHub Discussion (or an issue) describing what you want to build before you write code. The reason is concrete: we may already have planned API evolution that affects the surface you'd touch, and we'd rather flag that upfront than ask you to refactor after review.

A useful discussion includes:

- What problem you want to solve.
- The shape of the API you'd add or change.
- Whether you've identified existing interfaces this fits into, or you need new ones.
- The chain or chains your adapter targets, if applicable.

We respond with whichever of these applies: green-light to proceed, planned API changes you should align with, an alternative direction we'd prefer, or an explanation of why the change isn't a fit for the SDK.

---

## What we guarantee vs what may evolve

The full versioning policy lives in [`docs/architecture/adapter-spec/08-versioning.md`](docs/architecture/adapter-spec/08-versioning.md). Condensed for contributors:

**Stable across minor releases (changes here trigger a major bump):**

- Exported symbols documented with JSDoc.
- Error class names.
- Lifecycle hook keys.

**May evolve with a deprecation window:**

- Sub-path import paths (`@dappbooster/evm-adapter/wagmi` and similar).
- The `dappbooster.codegen` package.json field convention.

**No guarantees:**

- Internal helpers, file layout, build outputs, anything not exported.

If your adapter depends on something not in the stable surface, expect to update it during the deprecation window when we evolve that surface.

---

## How we communicate changes

- **GitHub Releases** — every published version. Subscribe to release notifications on the relevant `@dappbooster/*` package to catch breaking changes.
- **GitHub Discussions** — coordination for in-flight work that crosses adapter boundaries.

We don't run a Discord or Slack for adapter authors yet. If contribution volume grows enough to justify one, we'll add it here.

---

## Development setup

Requirements:

- Node 24+ (see `.nvmrc`)
- pnpm 10.30.2+ (enforced via `packageManager` in `package.json`)

Setup:

```bash
pnpm install
cp .env.example .env.local
# edit .env.local — see README for required vars
pnpm dev
```

Commit conventions, code style, and validation commands live in [CLAUDE.md](CLAUDE.md). Run the full validation checklist before pushing:

```bash
pnpm lint
pnpm test
pnpm build
```

---

## Quick reference

| You want to… | Do this |
|---|---|
| Report a bug | Open a GitHub Issue using the bug template |
| Request a feature | Open a GitHub Issue using the feature template |
| Discuss a substantial change | Open a GitHub Discussion before writing code |
| Contribute an adapter | Open a discussion first; we'll guide the integration |
| Fix a typo or small bug | PR directly; reference the issue in the PR description |

PR title and body conventions are documented in [CLAUDE.md](CLAUDE.md). Every PR mirrors the linked issue's acceptance criteria and ships with passing validation.
