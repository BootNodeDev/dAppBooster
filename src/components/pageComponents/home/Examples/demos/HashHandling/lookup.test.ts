import type { PublicClient, Transaction } from 'viem'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { multiChainLookup } from './lookup'

vi.mock('@/src/core/utils/hash', async () => {
  const actual =
    await vi.importActual<typeof import('@/src/core/utils/hash')>('@/src/core/utils/hash')
  return { ...actual, default: vi.fn() }
})

const detectHashModule = await import('@/src/core/utils/hash')
const detectHash = detectHashModule.default as Mock

const TX_HASH = '0xd85ef8c70dc31a4f8d5bf0331e1eac886935905f15d32e71b348df745cd38e19'
const ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'

const tag = (chainId: number): PublicClient => ({ __chainId: chainId }) as unknown as PublicClient

const buildMap = (ids: number[]) => new Map<number, PublicClient>(ids.map((id) => [id, tag(id)]))

describe('multiChainLookup', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('queries primary chain first for tx hash', async () => {
    detectHash
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'not-found' })

    await multiChainLookup(TX_HASH, buildMap([1, 11155111, 84532]), 1)

    expect(detectHash).toHaveBeenNthCalledWith(1, {
      publicClient: expect.objectContaining({ __chainId: 1 }),
      hashOrString: TX_HASH,
    })
  })

  it('returns first chain that has the tx', async () => {
    const tx = { hash: TX_HASH } as unknown as Transaction
    detectHash
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'found', type: 'transaction', data: tx })
      .mockResolvedValueOnce({ status: 'not-found' })

    const result = await multiChainLookup(TX_HASH, buildMap([1, 11155111, 84532]), 1)

    expect(result.found?.chainId).toBe(11155111)
    expect(result.errors).toEqual([])
  })

  it('does not fan out for address input', async () => {
    detectHash.mockResolvedValueOnce({ status: 'found', type: 'EOA', data: ADDRESS })

    const result = await multiChainLookup(ADDRESS, buildMap([1, 11155111, 84532]), 1)

    expect(detectHash).toHaveBeenCalledTimes(1)
    expect(result.found?.chainId).toBe(1)
  })

  it('aggregates primary rpc-error with secondary errors', async () => {
    detectHash
      .mockResolvedValueOnce({ status: 'rpc-error', error: new Error('primary down') })
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'rpc-error', error: new Error('secondary down') })

    const result = await multiChainLookup(TX_HASH, buildMap([1, 11155111, 84532]), 1)

    expect(result.found).toBeNull()
    expect(result.errors).toHaveLength(2)
    expect(result.errors.map((entry) => entry.chainId).sort()).toEqual([1, 84532])
  })

  it('returns all-errored state when every chain fails', async () => {
    detectHash
      .mockResolvedValueOnce({ status: 'rpc-error', error: new Error('a') })
      .mockResolvedValueOnce({ status: 'rpc-error', error: new Error('b') })
      .mockResolvedValueOnce({ status: 'rpc-error', error: new Error('c') })

    const result = await multiChainLookup(TX_HASH, buildMap([1, 11155111, 84532]), 1)

    expect(result.found).toBeNull()
    expect(result.errors).toHaveLength(3)
  })

  it('returns empty when primary chain client is missing', async () => {
    const result = await multiChainLookup(TX_HASH, new Map(), 1)

    expect(result.found).toBeNull()
    expect(result.errors).toEqual([])
    expect(detectHash).not.toHaveBeenCalled()
  })
})
