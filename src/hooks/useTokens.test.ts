import type { TokenAmount, TokensResponse } from '@lifi/sdk'
import { zeroAddress } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import type { Token, Tokens } from '@/src/types/token'
import { updateTokensBalances } from './useTokens'

// Mimic a setup that overrides PUBLIC_NATIVE_TOKEN_ADDRESS to the Aave-style sentinel
// (0xEeee...), which env.ts lowercases. The merge must bridge this back to LI.FI's
// zero-address convention.
const { LOCAL_NATIVE } = vi.hoisted(() => ({
  LOCAL_NATIVE: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
}))

vi.mock('@/src/env', () => ({
  env: { PUBLIC_NATIVE_TOKEN_ADDRESS: LOCAL_NATIVE, PUBLIC_APP_NAME: 'test' },
}))

const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

const localTokens: Tokens = [
  { chainId: 1, address: LOCAL_NATIVE, name: 'Ether', symbol: 'ETH', decimals: 18 },
  { chainId: 1, address: usdcAddress, name: 'USD Coin', symbol: 'USDC', decimals: 6 },
]

const makeLifiToken = (address: string, symbol: string, decimals: number, priceUSD: string) => ({
  chainId: 1,
  address,
  symbol,
  name: symbol,
  decimals,
  priceUSD,
})

describe('updateTokensBalances', () => {
  it('merges LI.FI native balance onto a local native token that uses a non-zero sentinel', () => {
    const prices: TokensResponse = {
      tokens: {
        1: [
          makeLifiToken(zeroAddress, 'ETH', 18, '2300'),
          makeLifiToken(usdcAddress, 'USDC', 6, '1'),
        ],
      },
    }
    const balances: TokenAmount[] = [
      { ...makeLifiToken(zeroAddress, 'ETH', 18, '2300'), amount: 1_758_640_884_554_030_066n },
      { ...makeLifiToken(usdcAddress, 'USDC', 6, '1'), amount: 5_000_000n },
    ]

    const { tokens } = updateTokensBalances(localTokens, [balances, prices])

    const eth = tokens.find((t: Token) => t.address === LOCAL_NATIVE)
    const usdc = tokens.find((t: Token) => t.address === usdcAddress)

    expect(eth?.extensions?.balance).toBe(1_758_640_884_554_030_066n)
    expect(eth?.extensions?.priceUSD).toBe('2300')
    expect(usdc?.extensions?.balance).toBe(5_000_000n)
    expect(usdc?.extensions?.priceUSD).toBe('1')
  })

  it('falls back to zero balance when LI.FI has no data for a local token', () => {
    const prices: TokensResponse = { tokens: { 1: [] } }
    const balances: TokenAmount[] = []

    const { tokens } = updateTokensBalances(localTokens, [balances, prices])

    for (const token of tokens) {
      expect(token.extensions?.balance).toBe(0n)
      expect(token.extensions?.priceUSD).toBe('0')
    }
  })
})
