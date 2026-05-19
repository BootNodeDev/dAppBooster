import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import type { ChainDescriptor } from './descriptor'
import { getExplorerUrl } from './explorer'
import { createChainRegistry } from './registry'

const explorerUrlArb = fc.webUrl({ withFragments: false, withQueryParameters: false })
const pathArb = fc.constantFrom('/tx/{id}', '/address/{id}', '/block/{id}')

type DescriptorWithExplorer = ChainDescriptor & {
  explorer: NonNullable<ChainDescriptor['explorer']>
}

const descriptorWithExplorerArb: fc.Arbitrary<DescriptorWithExplorer> = fc
  .record({
    chainId: fc.integer({ min: 1, max: 2 ** 31 - 1 }),
    caip2Namespace: fc.stringMatching(/^[a-z][a-z0-9]{2,7}$/),
    caip2Reference: fc.stringMatching(/^[-_a-zA-Z0-9]{1,32}$/),
    explorerUrl: explorerUrlArb,
    txPath: pathArb,
    addressPath: pathArb,
    blockPath: pathArb,
  })
  .map((parts) => ({
    chainId: parts.chainId,
    caip2Id: `${parts.caip2Namespace}:${parts.caip2Reference}`,
    chainType: 'evm' as const,
    name: 'Test',
    nativeCurrency: { symbol: 'TST', decimals: 18 },
    addressConfig: { format: 'hex' as const, patterns: [], example: '0x...' },
    explorer: {
      name: 'Test Explorer',
      url: parts.explorerUrl,
      txPath: parts.txPath,
      addressPath: parts.addressPath,
      blockPath: parts.blockPath,
    },
  }))

const txValueArb = fc.stringMatching(/^0x[0-9a-f]{64}$/)
const addressValueArb = fc.stringMatching(/^0x[0-9a-f]{40}$/)
const blockValueArb = fc.integer({ min: 0, max: 2 ** 31 - 1 })

describe('getExplorerUrl — properties', () => {
  it('returns a parseable URL for tx lookups', () => {
    fc.assert(
      fc.property(descriptorWithExplorerArb, txValueArb, (descriptor, tx) => {
        const registry = createChainRegistry([descriptor])
        const url = getExplorerUrl(registry, { chainId: descriptor.chainId, tx })
        expect(url).not.toBeNull()
        if (url !== null) {
          expect(() => new URL(url)).not.toThrow()
        }
      }),
    )
  })

  it('returns a parseable URL for address lookups', () => {
    fc.assert(
      fc.property(descriptorWithExplorerArb, addressValueArb, (descriptor, address) => {
        const registry = createChainRegistry([descriptor])
        const url = getExplorerUrl(registry, { chainId: descriptor.chainId, address })
        expect(url).not.toBeNull()
        if (url !== null) {
          expect(() => new URL(url)).not.toThrow()
        }
      }),
    )
  })

  it('returns a parseable URL for block lookups', () => {
    fc.assert(
      fc.property(descriptorWithExplorerArb, blockValueArb, (descriptor, block) => {
        const registry = createChainRegistry([descriptor])
        const url = getExplorerUrl(registry, { chainId: descriptor.chainId, block })
        expect(url).not.toBeNull()
        if (url !== null) {
          expect(() => new URL(url)).not.toThrow()
        }
      }),
    )
  })

  it('returns null when descriptor has no explorer', () => {
    const descriptorNoExplorerArb = descriptorWithExplorerArb.map(
      ({ explorer: _explorer, ...rest }) => rest,
    )
    fc.assert(
      fc.property(descriptorNoExplorerArb, txValueArb, (descriptor, tx) => {
        const registry = createChainRegistry([descriptor])
        const url = getExplorerUrl(registry, { chainId: descriptor.chainId, tx })
        expect(url).toBeNull()
      }),
    )
  })

  it('output URL contains the substituted value and no placeholder remains', () => {
    fc.assert(
      fc.property(descriptorWithExplorerArb, txValueArb, (descriptor, tx) => {
        const registry = createChainRegistry([descriptor])
        const url = getExplorerUrl(registry, { chainId: descriptor.chainId, tx })
        expect(url).not.toBeNull()
        if (url !== null) {
          expect(url).toContain(tx)
          expect(url).not.toContain('{id}')
        }
      }),
    )
  })
})
