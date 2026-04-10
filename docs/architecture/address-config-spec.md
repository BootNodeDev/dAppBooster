# AddressConfig Robustness and Standards Alignment Spec

> **Status:** Draft — proposed for post-review implementation
> **Date:** 2026-04-06
> **Branch at drafting time:** `feat/huge-auto-refactor`
> **Related file:** `src/sdk/core/chain/descriptor.ts`

## Overview

This spec defines a stronger, standards-aware model for `AddressConfig` used in chain descriptors.

The current model is practical and already useful:

- It captures major address families used across EVM, Solana, Cosmos, Bitcoin, and Substrate ecosystems.
- It keeps chain metadata chain-agnostic.
- It is easy to consume in TypeScript.

However, it is currently a broad union with optional fields that are not constrained by format-specific rules. This allows structurally invalid combinations at compile time (for example, `format: 'ss58'` without an SS58 prefix).

This proposal keeps the existing taxonomy and ergonomics but adds compile-time guarantees, clearer standards mapping, and a cleaner path to JSON/registry interoperability.

## Current Repository State (Audit Snapshot)

As of 2026-04-06 on branch `feat/huge-auto-refactor`, there is no dedicated runtime schema validation for `AddressConfig` or `ChainDescriptor` (for example, no Zod schema in `src/sdk/**`).

Runtime checks currently present are limited to:

1. Registry uniqueness checks in `createChainRegistry` for duplicate `chainId` and duplicate `caip2Id`.
2. Deterministic EVM descriptor construction in `fromViemChain` with hardcoded `addressConfig` values.

Not currently present:

1. Runtime validation that `addressConfig.format` implies required fields (for example `hrp` or `ss58Prefix`).
2. Runtime validation that each regex in `patterns` is non-empty and semantically aligned to `format`.
3. Runtime schema parsing for externally sourced descriptors.

This spec intentionally avoids duplicating existing checks and focuses on adding the missing format-aware validation layer.

## Review Decisions (2026-04-06)

From branch review feedback:

1. Provider behavior SHOULD fail fast on duplicate `caip2Id` instead of silently deduping.
2. External JSON/runtime descriptor loading is not a near-term product goal.

Implementation implication:

- Treat strict descriptor validation as a core-internal invariant by default.
- If descriptor loading from external JSON is added later, reuse the same validation contract at the ingestion boundary.

## Problem Statement

Current `AddressConfig` shape:

```ts
interface AddressConfig {
  format: 'hex' | 'base58' | 'bech32' | 'bech32m' | 'ss58' | 'named' | 'other'
  prefix?: string
  patterns: RegExp[]
  example?: string
}
```

Main issues:

1. `prefix` is loosely typed for all formats, even though semantics differ by standard.
2. `patterns: RegExp[]` is TypeScript-friendly but not serialization-friendly for registries.
3. No explicit standards metadata (for example BIP-173 / BIP-350 / CAIP account framing), so external interoperability requires implicit knowledge.
4. The union is open enough to allow configurations that violate ecosystem rules.

## Goals

1. Preserve the same address-family vocabulary for developer familiarity.
2. Enforce format-specific requirements at compile time.
3. Add explicit standards metadata without overfitting to one ecosystem.
4. Support both runtime validation and JSON-safe representation.
5. Allow gradual migration with low breakage risk.

## Non-Goals

1. Replacing CAIP-2 or changing `ChainDescriptor` identity semantics.
2. Defining a universal on-chain address parser.
3. Forcing every chain into one account model.

## Standards Position

This schema is intentionally compositional rather than tied to one monolithic external standard.

Standards and conventions referenced:

- **CAIP-2** for chain identity (`caip2Id`) at the descriptor level.
- **CAIP-10-compatible thinking** for account addressing interoperability (optional metadata).
- **BIP-173** for `bech32`.
- **BIP-350** for `bech32m`.
- **SS58** specification for Substrate-family addresses.
- **EVM 0x hex + EIP-55 checksum convention** for `hex` chains.

Conclusion: the descriptor remains an internal contract, but with explicit standards mapping so bridges/importers/exporters can be deterministic.

## Proposed Type Design

### 1) Introduce explicit address format aliases

```ts
export type AddressFormat =
  | 'hex'
  | 'base58'
  | 'bech32'
  | 'bech32m'
  | 'ss58'
  | 'named'
  | 'other'
```

### 2) Split runtime regex from serializable pattern source

```ts
export interface AddressPatternConfig {
  /** Portable string regex for JSON/registry transport. */
  source: string
  /** Optional regex flags, for example 'i'. */
  flags?: string
}
```

### 3) Add optional standards metadata

```ts
export interface AddressStandardRef {
  /** Canonical spec identifier, for example 'bip-173', 'bip-350', 'ss58'. */
  id: string
  /** Optional URL to spec text or canonical reference page. */
  uri?: string
}
```

### 4) Use discriminated unions for format-specific requirements

```ts
interface AddressConfigBase {
  /** One or more validation patterns. */
  patterns: AddressPatternConfig[]
  /** Example address for docs/tests. */
  example?: string
  /** Optional standards references for this format. */
  standards?: AddressStandardRef[]
}

export interface HexAddressConfig extends AddressConfigBase {
  format: 'hex'
  /** Optional checksum profile, for example 'eip55'. */
  checksum?: 'none' | 'eip55' | 'chain-aware'
}

export interface Base58AddressConfig extends AddressConfigBase {
  format: 'base58'
  /** Optional variant for clarity where relevant. */
  variant?: 'bitcoin' | 'solana' | 'custom'
}

export interface Bech32AddressConfig extends AddressConfigBase {
  format: 'bech32'
  /** Human-readable part, for example 'cosmos', 'osmo', 'bc'. */
  hrp: string
}

export interface Bech32mAddressConfig extends AddressConfigBase {
  format: 'bech32m'
  /** Human-readable part, for example 'bc' for taproot contexts. */
  hrp: string
}

export interface Ss58AddressConfig extends AddressConfigBase {
  format: 'ss58'
  /** Substrate network address type/prefix (numeric). */
  ss58Prefix: number
}

export interface NamedAddressConfig extends AddressConfigBase {
  format: 'named'
  /** Optional resolver namespace, for example 'ens', 'sns', 'farcaster'. */
  namespace?: string
}

export interface OtherAddressConfig extends AddressConfigBase {
  format: 'other'
  /** Required explanation for custom/unknown formats. */
  note: string
}

export type AddressConfig =
  | HexAddressConfig
  | Base58AddressConfig
  | Bech32AddressConfig
  | Bech32mAddressConfig
  | Ss58AddressConfig
  | NamedAddressConfig
  | OtherAddressConfig
```

## Mapping of Existing Format Values

- `hex`: EVM-family chains and any chain using canonical 0x hex account addresses.
- `base58`: Solana-style and other base58 account address ecosystems.
- `bech32`: Cosmos-family and other BIP-173 variants.
- `bech32m`: BIP-350 address families.
- `ss58`: Substrate/Polkadot ecosystem.
- `named`: Human-readable aliasing systems that resolve to accounts.
- `other`: Explicit escape hatch with required context (`note`).

## Backward Compatibility Plan

### Phase 1: Type-safe additive rollout

1. Keep existing `AddressConfig` export name.
2. Internally replace old interface with the new discriminated union.
3. Provide compatibility helper for old in-memory definitions:

```ts
function normalizeLegacyAddressConfig(input: {
  format: 'hex' | 'base58' | 'bech32' | 'bech32m' | 'ss58' | 'named' | 'other'
  prefix?: string
  patterns: RegExp[]
  example?: string
}): AddressConfig {
  // Converts legacy shape into new union.
  // Behavior examples:
  // - bech32/bech32m require prefix -> hrp
  // - ss58 parses numeric prefix from string
  // - RegExp[] -> AddressPatternConfig[] via source/flags
  throw new Error('implementation pending')
}
```

### Phase 2: Migration of in-repo descriptors

1. Update descriptor definitions to the new shape.
2. Replace direct `RegExp` literals with `{ source, flags }` where persistence/export matters.
3. Keep a utility to compile patterns at runtime:

```ts
export function compileAddressPatterns(patterns: AddressPatternConfig[]): RegExp[] {
  return patterns.map((pattern) => new RegExp(pattern.source, pattern.flags))
}
```

### Phase 3: Interop validation

1. Add tests that verify standards metadata and required fields by format.
2. Add round-trip test for JSON serialization/deserialization.

## Validation Rules (Normative)

1. `bech32` and `bech32m` MUST include `hrp`.
2. `ss58` MUST include `ss58Prefix` as a non-negative integer.
3. `other` MUST include a non-empty `note`.
4. `patterns` MUST contain at least one pattern.
5. Each `AddressPatternConfig.source` MUST compile as a valid JavaScript regex.

## Example Descriptor Snippets

### EVM

```ts
addressConfig: {
  format: 'hex',
  checksum: 'eip55',
  patterns: [{ source: '^0x[a-fA-F0-9]{40}$' }],
  standards: [{ id: 'eip-55' }],
  example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
}
```

### Cosmos

```ts
addressConfig: {
  format: 'bech32',
  hrp: 'cosmos',
  patterns: [{ source: '^cosmos1[0-9a-z]{38,58}$' }],
  standards: [{ id: 'bip-173' }],
  example: 'cosmos1p8h8x9x3h4k5l6m7n8q9r0s2t3u4v5w6y7z8a'
}
```

### Substrate

```ts
addressConfig: {
  format: 'ss58',
  ss58Prefix: 0,
  patterns: [{ source: '^[1-9A-HJ-NP-Za-km-z]{47,48}$' }],
  standards: [{ id: 'ss58' }],
  example: '12D3KooWJ7xJYVb8f8r1V9jM8b7g4yQ1hRk5pAq2sM3nT4uV'
}
```

## Tradeoffs

Benefits:

- Prevents invalid config combinations at compile time.
- Improves self-documentation of address semantics.
- Enables JSON-native transport of descriptor metadata.
- Makes standards conformance explicit and testable.

Costs:

- Slightly more verbose descriptor definitions.
- Requires migration of existing in-code regex values.
- Requires a small runtime compilation step when regex objects are needed.

## Acceptance Criteria

1. `AddressConfig` is a discriminated union with required fields per format.
2. Existing descriptor definitions compile after migration helpers are applied.
3. Unit tests cover all format variants and validation invariants.
4. At least one serialization round-trip test passes for descriptor data.
5. No runtime behavior regression in consumers that only inspect `format` and `example`.

## Default Decisions

The following decisions are now the default implementation path for this spec:

1. `named` keeps optional `namespace` for now. A required resolver field is deferred until at least two concrete resolver integrations exist in core.
2. `base58.variant` remains optional. It should be set whenever known, but omission does not block descriptor validity.
3. `AddressStandardRef.id` remains free-form string in v1 for flexibility. Add lint/test enforcement to catch typos in known IDs.
4. Provider deduplication by `caip2Id` should be removed. Duplicate descriptors must fail fast at registry build time.
5. Validation strategy is strict-by-default in core. No relaxed mode is defined in this spec.

### Clarifying Notes

- Keeping `namespace` optional avoids premature locking into resolver assumptions while preserving extensibility.
- Optional `base58.variant` prevents migration friction for ecosystems where variant information is ambiguous or not yet curated.
- Free-form standards IDs avoid churn during ecosystem expansion; consistency is handled by repository policy and tests.
- Removing provider dedupe ensures descriptor conflicts are surfaced immediately rather than hidden by last-write-wins behavior.

## Recommended Follow-up Work Items

1. Implement union types and helper utilities in `src/sdk/core/chain/descriptor.ts`.
2. Add `addressConfig` normalization tests in the SDK core test suite.
3. Define JSON import/export contract for chain descriptors.
4. Remove `caip2Id` deduplication in `src/sdk/react/provider/DAppBoosterProvider.tsx` and rely on `createChainRegistry` for conflict detection.
5. Document descriptor authoring guidelines in architecture docs.
