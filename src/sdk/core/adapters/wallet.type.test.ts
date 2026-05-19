import { describe, expectTypeOf, it } from 'vitest'

import type { ChainSigner, WalletAdapter, WalletStatus } from './wallet'

describe('WalletAdapter — types', () => {
  it('getSigner returns Promise<ChainSigner | null>', () => {
    expectTypeOf<WalletAdapter['getSigner']>().returns.toEqualTypeOf<Promise<ChainSigner | null>>()
  })

  it('ChainSigner is unknown (paradigm-agnostic)', () => {
    expectTypeOf<ChainSigner>().toEqualTypeOf<unknown>()
  })

  it('WalletStatus.connectedChainIds is (string | number)[]', () => {
    expectTypeOf<WalletStatus['connectedChainIds']>().toEqualTypeOf<(string | number)[]>()
  })

  it('WalletStatus.connected is boolean', () => {
    expectTypeOf<WalletStatus['connected']>().toEqualTypeOf<boolean>()
  })

  it('WalletStatus.activeAccount is string | null', () => {
    expectTypeOf<WalletStatus['activeAccount']>().toEqualTypeOf<string | null>()
  })

  it('WalletAdapter chainType is generic-parameter-narrowed', () => {
    expectTypeOf<WalletAdapter<'evm'>['chainType']>().toEqualTypeOf<'evm'>()
    expectTypeOf<WalletAdapter['chainType']>().toEqualTypeOf<string>()
  })
})
