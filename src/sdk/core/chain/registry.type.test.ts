import { describe, expectTypeOf, it } from 'vitest'

import type { ChainDescriptor } from './descriptor'
import { createChainRegistry } from './registry'

describe('ChainRegistry — types', () => {
  it('getChain accepts string | number chainId', () => {
    const registry = createChainRegistry([])
    expectTypeOf(registry.getChain).parameter(0).toEqualTypeOf<string | number>()
  })

  it('getChain returns ChainDescriptor | null', () => {
    const registry = createChainRegistry([])
    expectTypeOf(registry.getChain).returns.toEqualTypeOf<ChainDescriptor | null>()
  })

  it('getChainByCaip2 returns ChainDescriptor | null', () => {
    const registry = createChainRegistry([])
    expectTypeOf(registry.getChainByCaip2).returns.toEqualTypeOf<ChainDescriptor | null>()
  })

  it('getChainType returns string | null', () => {
    const registry = createChainRegistry([])
    expectTypeOf(registry.getChainType).returns.toEqualTypeOf<string | null>()
  })

  it('getChainsByType returns ChainDescriptor[]', () => {
    const registry = createChainRegistry([])
    expectTypeOf(registry.getChainsByType).returns.toEqualTypeOf<ChainDescriptor[]>()
  })

  it('getAllChains returns ChainDescriptor[]', () => {
    const registry = createChainRegistry([])
    expectTypeOf(registry.getAllChains).returns.toEqualTypeOf<ChainDescriptor[]>()
  })

  it('createChainRegistry accepts ChainDescriptor[]', () => {
    expectTypeOf(createChainRegistry).parameter(0).toEqualTypeOf<ChainDescriptor[]>()
  })
})
