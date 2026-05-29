import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import { ChainRegistryConflictError } from '../errors'
import type { ChainDescriptor } from './descriptor'
import { createChainRegistry } from './registry'

// Generators for valid ChainDescriptor inputs
const chainTypeArb = fc.constantFrom('evm', 'svm', 'cosmos', 'canton')

const numericChainIdArb = fc.integer({ min: 1, max: 2 ** 31 - 1 })
// Non-numeric string ids so coercion never collides with the numeric variant
const stringChainIdArb = fc.stringMatching(/^[a-z][-_a-z0-9]{2,31}$/)

const chainIdArb = fc.oneof(numericChainIdArb, stringChainIdArb)

const caip2NamespaceArb = fc.stringMatching(/^[a-z][a-z0-9]{2,7}$/)
const caip2ReferenceArb = fc.stringMatching(/^[-_a-zA-Z0-9]{1,32}$/)

const descriptorArb: fc.Arbitrary<ChainDescriptor> = fc
  .record({
    chainId: chainIdArb,
    caip2Namespace: caip2NamespaceArb,
    caip2Reference: caip2ReferenceArb,
    chainType: chainTypeArb,
    name: fc.string({ minLength: 1, maxLength: 64 }),
    symbol: fc.string({ minLength: 1, maxLength: 8 }),
    decimals: fc.integer({ min: 0, max: 36 }),
  })
  .map(({ chainId, caip2Namespace, caip2Reference, chainType, name, symbol, decimals }) => ({
    chainId,
    caip2Id: `${caip2Namespace}:${caip2Reference}`,
    chainType,
    name,
    nativeCurrency: { symbol, decimals },
    addressConfig: { format: 'hex' as const, patterns: [], example: '0x...' },
  }))

describe('ChainRegistry — properties', () => {
  it('round-trip: getChain(chainId) returns the descriptor that was added', () => {
    fc.assert(
      fc.property(descriptorArb, (descriptor) => {
        const registry = createChainRegistry([descriptor])
        expect(registry.getChain(descriptor.chainId)).toEqual(descriptor)
      }),
    )
  })

  it('round-trip: getChainByCaip2(caip2Id) returns the descriptor that was added', () => {
    fc.assert(
      fc.property(descriptorArb, (descriptor) => {
        const registry = createChainRegistry([descriptor])
        expect(registry.getChainByCaip2(descriptor.caip2Id)).toEqual(descriptor)
      }),
    )
  })

  it('coercion: getChain(String(numericId)) === getChain(numericId)', () => {
    const numericDescriptorArb = descriptorArb.filter((d) => typeof d.chainId === 'number')
    fc.assert(
      fc.property(numericDescriptorArb, (descriptor) => {
        const registry = createChainRegistry([descriptor])
        const byNumber = registry.getChain(descriptor.chainId)
        const byString = registry.getChain(String(descriptor.chainId))
        expect(byString).toEqual(byNumber)
      }),
    )
  })

  it('unknown chainId returns null', () => {
    fc.assert(
      fc.property(descriptorArb, fc.string({ minLength: 1 }), (descriptor, unknownId) => {
        // Reject collisions with the registered chain (string or numeric coercion)
        fc.pre(String(descriptor.chainId) !== unknownId && descriptor.caip2Id !== unknownId)
        // Also reject numeric-coercion collisions
        const numericProbe = Number(unknownId)
        fc.pre(!(Number.isFinite(numericProbe) && numericProbe === Number(descriptor.chainId)))
        const registry = createChainRegistry([descriptor])
        expect(registry.getChain(unknownId)).toBeNull()
      }),
    )
  })

  it('duplicate detection: two descriptors sharing caip2Id throw ChainRegistryConflictError', () => {
    fc.assert(
      fc.property(descriptorArb, descriptorArb, (first, second) => {
        // Force the second descriptor to share first.caip2Id but keep a distinct chainId
        // (so the caip2Id check fires, not the chainId check). When chainIds collide we
        // still expect the same error class.
        const conflicting: ChainDescriptor = { ...second, caip2Id: first.caip2Id }
        fc.pre(JSON.stringify(first) !== JSON.stringify(conflicting))
        expect(() => createChainRegistry([first, conflicting])).toThrow(ChainRegistryConflictError)
      }),
    )
  })

  it('duplicate detection: two descriptors sharing chainId throw ChainRegistryConflictError', () => {
    fc.assert(
      fc.property(descriptorArb, descriptorArb, (first, second) => {
        // Force the second descriptor to share first.chainId with a distinct caip2Id.
        const conflicting: ChainDescriptor = {
          ...second,
          chainId: first.chainId,
          caip2Id: `${first.caip2Id}-dup`,
        }
        fc.pre(JSON.stringify(first) !== JSON.stringify(conflicting))
        expect(() => createChainRegistry([first, conflicting])).toThrow(ChainRegistryConflictError)
      }),
    )
  })

  // Locks the chainId-normalization collision: two DISTINCT descriptors whose chainIds are
  // string-equal under String() (e.g. number 1 vs string "1") must be rejected at construction,
  // otherwise the coerced lookup fallback could return a foreign chain. The example generators
  // above deliberately avoid this collision; here we force it and assert it throws.
  it('normalized chainId collision: descriptors with String(a.chainId) === String(b.chainId) and distinct caip2Id throw', () => {
    fc.assert(
      fc.property(descriptorArb, descriptorArb, numericChainIdArb, (first, second, sharedId) => {
        const a: ChainDescriptor = { ...first, chainId: sharedId, caip2Id: `eip155:${sharedId}` }
        // Same id by string normalization, distinct caip2Id, supplied as a string so the raw
        // Map keys differ but String() coerces them equal.
        const b: ChainDescriptor = {
          ...second,
          chainId: String(sharedId),
          caip2Id: `eip155:${sharedId}-dup`,
        }
        const conflictError = (() => {
          try {
            createChainRegistry([a, b])
            return null
          } catch (error) {
            return error
          }
        })()
        expect(conflictError).toBeInstanceOf(ChainRegistryConflictError)
        expect((conflictError as ChainRegistryConflictError).conflictOn).toBe('chainId')
      }),
    )
  })

  it('getChainType: returns the descriptor chainType for any registered chainId', () => {
    fc.assert(
      fc.property(descriptorArb, (descriptor) => {
        const registry = createChainRegistry([descriptor])
        expect(registry.getChainType(descriptor.chainId)).toBe(descriptor.chainType)
      }),
    )
  })

  // Kills chain/registry.ts:60-61 ConditionalExpression / EqualityOperator survivors.
  // The string→number coercion guard returns null when Number(s) is NaN. If the guard is
  // removed, `byChainId.get(NaN)` is called instead — which still returns undefined, BUT only
  // because no chain is registered with NaN as a key. Probe with a registry that has a real
  // numeric chain to make the difference observable: a NaN-coercing string must return null
  // regardless of which numeric chains are registered.
  it('NaN-coercion: any string that coerces to NaN returns null even with numeric chains registered', () => {
    const numericDescriptorArb = descriptorArb.filter((d) => typeof d.chainId === 'number')
    const nanStringArb = fc
      .string({ minLength: 1, maxLength: 32 })
      .filter((s) => Number.isNaN(Number(s)))
    fc.assert(
      fc.property(numericDescriptorArb, nanStringArb, (descriptor, nanString) => {
        // Reject collisions with the registered descriptor's string keys.
        fc.pre(nanString !== descriptor.caip2Id && nanString !== String(descriptor.chainId))
        const registry = createChainRegistry([descriptor])
        expect(registry.getChain(nanString)).toBeNull()
        expect(registry.getChainType(nanString)).toBeNull()
      }),
    )
  })

  // Kills chain/registry.ts:36 StringLiteral survivor on `conflictOn: 'chainId'`.
  // Existing example tests assert the error class but not the `conflictOn` payload, so the
  // mutation `conflictOn: ''` survives. This property locks the payload value.
  it('duplicate detection: chainId conflict produces error with conflictOn === "chainId"', () => {
    fc.assert(
      fc.property(descriptorArb, descriptorArb, (first, second) => {
        const conflicting: ChainDescriptor = {
          ...second,
          chainId: first.chainId,
          caip2Id: `${first.caip2Id}-dup`,
        }
        fc.pre(JSON.stringify(first) !== JSON.stringify(conflicting))
        try {
          createChainRegistry([first, conflicting])
          expect.fail('should have thrown ChainRegistryConflictError')
        } catch (error) {
          expect(error).toBeInstanceOf(ChainRegistryConflictError)
          const conflictError = error as ChainRegistryConflictError
          expect(conflictError.conflictOn).toBe('chainId')
        }
      }),
    )
  })

  // Kills chain/registry.ts:41,44 StringLiteral survivors on `conflictOn: 'caip2Id'`.
  // Same shape as above but for the caip2Id branch. The second descriptor must share caip2Id
  // with the first while having a distinct chainId, so the caip2Id check fires first.
  it('duplicate detection: caip2Id conflict produces error with conflictOn === "caip2Id"', () => {
    fc.assert(
      fc.property(descriptorArb, descriptorArb, (first, second) => {
        // Force shared caip2Id and a distinct chainId. Generate a chainId that cannot collide
        // with first.chainId (numeric or string-equivalent).
        const distinctChainId =
          typeof first.chainId === 'number'
            ? first.chainId + 1_000_000_000
            : `${first.chainId}-distinct`
        const conflicting: ChainDescriptor = {
          ...second,
          chainId: distinctChainId,
          caip2Id: first.caip2Id,
        }
        fc.pre(JSON.stringify(first) !== JSON.stringify(conflicting))
        try {
          createChainRegistry([first, conflicting])
          expect.fail('should have thrown ChainRegistryConflictError')
        } catch (error) {
          expect(error).toBeInstanceOf(ChainRegistryConflictError)
          const conflictError = error as ChainRegistryConflictError
          expect(conflictError.conflictOn).toBe('caip2Id')
        }
      }),
    )
  })
})
