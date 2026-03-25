import { createMockChain } from '@/src/test-utils'
import type { Chain } from 'viem'
import { describe, expect, it } from 'vitest'
import { getExplorerLink } from './getExplorerLink'

const chain = createMockChain()
// A valid address (40 hex chars after 0x)
const address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' as const
// A valid tx hash (64 hex chars after 0x)
const txHash = '0xd85ef8c70dc31a4f8d5bf0331e1eac886935905f15d32e71b348df745cd38e19' as const

describe('getExplorerLink', () => {
  it('returns address URL using chain block explorer', () => {
    const url = getExplorerLink({ chain, hashOrAddress: address })
    expect(url).toBe(`https://mock.explorer.url/address/${address}`)
  })

  it('returns tx URL using chain block explorer for a hash', () => {
    const url = getExplorerLink({ chain, hashOrAddress: txHash })
    expect(url).toBe(`https://mock.explorer.url/tx/${txHash}`)
  })

  it('uses custom explorerUrl for an address', () => {
    const explorerUrl = 'https://custom.explorer.io'
    const url = getExplorerLink({ chain, hashOrAddress: address, explorerUrl })
    expect(url).toBe(`${explorerUrl}/address/${address}`)
  })

  it('uses custom explorerUrl for a tx hash', () => {
    const explorerUrl = 'https://custom.explorer.io'
    const url = getExplorerLink({ chain, hashOrAddress: txHash, explorerUrl })
    expect(url).toBe(`${explorerUrl}/tx/${txHash}`)
  })

  it('throws for an invalid hash or address', () => {
    expect(() =>
      // biome-ignore lint/suspicious/noExplicitAny: intentionally testing invalid input
      getExplorerLink({ chain, hashOrAddress: 'not-valid' as any }),
    ).toThrow('Invalid hash or address')
  })

  it('throws when chain has no block explorer and no explorerUrl is provided', () => {
    const chainWithoutExplorer: Chain = { ...chain, blockExplorers: undefined }
    expect(() => getExplorerLink({ chain: chainWithoutExplorer, hashOrAddress: address })).toThrow(
      'No block explorer URL available for this chain',
    )
  })

  it('works with a chain that has no default block explorer (explorerUrl provided)', () => {
    const chainWithoutExplorer: Chain = { ...chain, blockExplorers: undefined }
    const explorerUrl = 'https://fallback.explorer.io'
    const url = getExplorerLink({
      chain: chainWithoutExplorer,
      hashOrAddress: address,
      explorerUrl,
    })
    expect(url).toBe(`${explorerUrl}/address/${address}`)
  })
})
