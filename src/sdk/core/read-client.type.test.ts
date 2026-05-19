import { describe, expectTypeOf, it } from 'vitest'

import type { ReadClientFactory } from './adapters/provider'
import { createReadClient } from './read-client'

describe('createReadClient — type narrowing', () => {
  it('infers TClient from the factory', () => {
    type MockClient = { kind: 'mock' }
    expectTypeOf<
      ReturnType<typeof createReadClient<MockClient>>
    >().toEqualTypeOf<MockClient | null>()
  })

  it('return type includes the null branch', () => {
    type MockClient = { kind: 'mock' }
    expectTypeOf<ReturnType<typeof createReadClient<MockClient>>>().toExtend<MockClient | null>()
  })

  it('chainId accepts string | number', () => {
    expectTypeOf(createReadClient).parameter(2).toEqualTypeOf<string | number>()
  })

  it('factory parameter is ReadClientFactory<TClient>', () => {
    type MockClient = { kind: 'mock' }
    expectTypeOf(createReadClient<MockClient>)
      .parameter(0)
      .toEqualTypeOf<ReadClientFactory<MockClient>>()
  })
})
