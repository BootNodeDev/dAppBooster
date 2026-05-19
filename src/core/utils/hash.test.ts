import type { Address, PublicClient, Transaction } from 'viem'
import * as viemActions from 'viem/actions'
import * as viemEns from 'viem/ens'
import { describe, expect, it, type Mock, vi } from 'vitest'

import detectHash, {
  detectAddressType,
  detectEnsName,
  detectTransactionHash,
} from '@/src/core/utils/hash'

vi.mock('viem/actions', () => ({
  getEnsAddress: vi.fn(),
  getTransaction: vi.fn(),
  getCode: vi.fn(),
}))

vi.mock('viem/ens', () => ({
  normalize: vi.fn((name: string) => name),
}))

const publicClient = {} as unknown as PublicClient

const TX_HASH = '0xd85ef8c70dc31a4f8d5bf0331e1eac886935905f15d32e71b348df745cd38e19'
const ADDRESS = '0x1234567890abcdef1234567890abcdef12345678' as Address

describe('detectTransactionHash', () => {
  it('returns { status: "found" } when viem returns a transaction', async () => {
    const tx = { hash: TX_HASH } as unknown as Transaction
    ;(viemActions.getTransaction as Mock).mockResolvedValueOnce(tx)

    const result = await detectTransactionHash(publicClient, TX_HASH)

    expect(result).toEqual({ status: 'found', type: 'transaction', data: tx })
  })

  it('returns { status: "not-found" } when viem returns null', async () => {
    ;(viemActions.getTransaction as Mock).mockResolvedValueOnce(null)

    const result = await detectTransactionHash(publicClient, TX_HASH)

    expect(result).toEqual({ status: 'not-found' })
  })

  it('returns { status: "rpc-error" } when viem throws', async () => {
    const err = new Error('Request timeout on the free tier')
    ;(viemActions.getTransaction as Mock).mockRejectedValueOnce(err)

    const result = await detectTransactionHash(publicClient, TX_HASH)

    expect(result).toEqual({ status: 'rpc-error', error: err })
  })
})

describe('detectAddressType', () => {
  it('returns { status: "found", type: "contract" } when bytecode exists', async () => {
    ;(viemActions.getCode as Mock).mockResolvedValueOnce('0x1234')

    const result = await detectAddressType(publicClient, ADDRESS)

    expect(result).toEqual({ status: 'found', type: 'contract', data: ADDRESS })
  })

  it('returns { status: "found", type: "EOA" } when bytecode is "0x"', async () => {
    ;(viemActions.getCode as Mock).mockResolvedValueOnce('0x')

    const result = await detectAddressType(publicClient, ADDRESS)

    expect(result).toEqual({ status: 'found', type: 'EOA', data: ADDRESS })
  })

  it('returns { status: "found", type: "EOA" } when getCode returns undefined', async () => {
    ;(viemActions.getCode as Mock).mockResolvedValueOnce(undefined)

    const result = await detectAddressType(publicClient, ADDRESS)

    expect(result).toEqual({ status: 'found', type: 'EOA', data: ADDRESS })
  })

  it('returns { status: "rpc-error" } when viem throws', async () => {
    const err = new Error('network error')
    ;(viemActions.getCode as Mock).mockRejectedValueOnce(err)

    const result = await detectAddressType(publicClient, ADDRESS)

    expect(result).toEqual({ status: 'rpc-error', error: err })
  })
})

describe('detectEnsName', () => {
  it('returns { status: "found", type: "ENS" } when ENS resolves to an address', async () => {
    ;(viemActions.getEnsAddress as Mock).mockResolvedValueOnce(ADDRESS)

    const result = await detectEnsName(publicClient, 'vitalik.eth')

    expect(result).toEqual({ status: 'found', type: 'ENS', data: ADDRESS })
  })

  it('returns { status: "not-found" } when getEnsAddress returns null', async () => {
    ;(viemActions.getEnsAddress as Mock).mockResolvedValueOnce(null)

    const result = await detectEnsName(publicClient, 'nonexistent.eth')

    expect(result).toEqual({ status: 'not-found' })
  })

  it('returns { status: "rpc-error" } when viem throws', async () => {
    const err = new Error('rpc down')
    ;(viemActions.getEnsAddress as Mock).mockRejectedValueOnce(err)

    const result = await detectEnsName(publicClient, 'vitalik.eth')

    expect(result).toEqual({ status: 'rpc-error', error: err })
  })

  it('returns { status: "not-found" } when normalize throws (invalid ENS shape)', async () => {
    ;(viemEns.normalize as Mock).mockImplementationOnce(() => {
      throw new Error('invalid name')
    })

    const result = await detectEnsName(publicClient, 'not a name!')

    expect(result).toEqual({ status: 'not-found' })
  })
})

describe('detectHash composition', () => {
  it('routes 66-char hex input to detectTransactionHash', async () => {
    const tx = { hash: TX_HASH } as unknown as Transaction
    ;(viemActions.getTransaction as Mock).mockResolvedValueOnce(tx)

    const result = await detectHash({ publicClient, hashOrString: TX_HASH })

    expect(viemActions.getTransaction).toHaveBeenCalled()
    expect(result).toEqual({ status: 'found', type: 'transaction', data: tx })
  })

  it('routes 42-char hex input to detectAddressType', async () => {
    ;(viemActions.getCode as Mock).mockResolvedValueOnce('0x')

    const result = await detectHash({ publicClient, hashOrString: ADDRESS })

    expect(viemActions.getCode).toHaveBeenCalled()
    expect(result).toEqual({ status: 'found', type: 'EOA', data: ADDRESS })
  })

  it('routes other strings to detectEnsName', async () => {
    ;(viemActions.getEnsAddress as Mock).mockResolvedValueOnce(ADDRESS)

    const result = await detectHash({ publicClient, hashOrString: 'vitalik.eth' })

    expect(viemActions.getEnsAddress).toHaveBeenCalled()
    expect(result).toEqual({ status: 'found', type: 'ENS', data: ADDRESS })
  })
})
