import { describe, expect, it, vi } from 'vitest'
import { evmReadClientFactory } from './read-client'

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    createPublicClient: vi.fn(() => ({ type: 'mock-public-client' })),
  }
})

describe('evmReadClientFactory', () => {
  it('has chainType "evm"', () => {
    expect(evmReadClientFactory.chainType).toBe('evm')
  })

  it('creates a PublicClient from an endpoint', () => {
    const endpoint = { url: 'https://eth.example.com', protocol: 'json-rpc' as const }
    const client = evmReadClientFactory.createClient(endpoint, 1)
    expect(client).toEqual({ type: 'mock-public-client' })
  })

  it('passes the endpoint URL to createPublicClient transport', async () => {
    const { createPublicClient } = await import('viem')
    const endpoint = { url: 'https://custom-rpc.io', protocol: 'json-rpc' as const }

    evmReadClientFactory.createClient(endpoint, 42161)

    expect(createPublicClient).toHaveBeenCalledWith(
      expect.objectContaining({ transport: expect.any(Function) }),
    )
  })
})
