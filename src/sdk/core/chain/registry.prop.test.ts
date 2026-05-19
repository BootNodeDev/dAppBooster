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

  it('getChainType: returns the descriptor chainType for any registered chainId', () => {
    fc.assert(
      fc.property(descriptorArb, (descriptor) => {
        const registry = createChainRegistry([descriptor])
        expect(registry.getChainType(descriptor.chainId)).toBe(descriptor.chainType)
      }),
    )
  })
})
