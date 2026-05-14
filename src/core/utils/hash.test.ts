import type { PublicClient, Transaction } from 'viem'
import * as viemActions from 'viem/actions'
import { describe, expect, it, type Mock, vi } from 'vitest'

import detectHash from '@/src/core/utils/hash'

// Mock viem functions
vi.mock('viem/actions', async () => {
  return {
    getEnsAddress: vi.fn(),
    getEnsName: vi.fn(),
    createPublicClient: vi.fn(),
    isAddress: vi.fn(),
    getTransaction: vi.fn(),
    getBytecode: vi.fn(),
    normalize: vi.fn(),
  }
})

// viem actions are mocked at the module level, so the PublicClient passed here
// only needs to satisfy the type system — no real RPC contact happens.
const publicClient = {} as unknown as PublicClient

describe('detectHash', () => {
  it('should detect a valid ENS name', async () => {
    const ensName = 'test.eth'

    const address = '0x1234567890abcdef1234567890abcdef12345678'
    ;(viemActions.getEnsAddress as Mock).mockResolvedValueOnce(address)

    const result = await detectHash({ publicClient, hashOrString: ensName })

    expect(result).toEqual({
      type: 'ENS',
      data: address,
    })
  })

  it('should detect a valid transaction hash', async () => {
    const txHash = '0xd85ef8c70dc31a4f8d5bf0331e1eac886935905f15d32e71b348df745cd38e19'
    const transaction = { hash: txHash } as unknown as Transaction
    ;(viemActions.getTransaction as Mock).mockResolvedValueOnce(transaction)

    const result = await detectHash({ publicClient, hashOrString: txHash })

    expect(result).toEqual({
      type: 'transaction',
      data: transaction,
    })
  })

  it('should detect a contract address', async () => {
    const contractAddress = '0x1234567890abcdef1234567890abcdef12345678'
    ;(viemActions.getBytecode as Mock).mockResolvedValueOnce('0x1234')

    const result = await detectHash({ publicClient, hashOrString: contractAddress })

    expect(result).toEqual({
      type: 'contract',
      data: contractAddress,
    })
  })

  it('should detect an EOA address with ENS name', async () => {
    const eoaAddress = '0x1234567890abcdef1234567890abcdef12345678'

    const ensName = 'test.eth'
    ;(viemActions.getBytecode as Mock).mockResolvedValueOnce('0x')
    ;(viemActions.getEnsName as Mock).mockResolvedValueOnce(ensName)

    const result = await detectHash({ publicClient, hashOrString: eoaAddress })

    expect(result).toEqual({
      type: 'EOA',
      data: eoaAddress,
    })
  })

  it('should return null for invalid input', async () => {
    const invalidInput = 'invalid-input'
    const result = await detectHash({ publicClient, hashOrString: invalidInput })

    expect(result).toEqual({
      type: null,
      data: null,
    })
  })
})
