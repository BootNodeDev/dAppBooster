import { describe, expect, it, vi } from 'vitest'
import type { ReadClientFactory } from './adapters/provider'
import { createChainRegistry } from './chain/registry'
import { createReadClient, resolveReadClient } from './read-client'

const mockEndpoint = { url: 'https://eth.example.com', protocol: 'json-rpc' as const }

const mockEvmChain = {
  caip2Id: 'eip155:1',
  chainId: 1,
  name: 'Ethereum',
  chainType: 'evm',
  nativeCurrency: { symbol: 'ETH', decimals: 18 },
  addressConfig: { format: 'hex' as const, patterns: [], example: '0x...' },
  endpoints: [mockEndpoint],
}

const mockSvmChain = {
  caip2Id: 'solana:mainnet',
  chainId: 'mainnet-beta',
  name: 'Solana',
  chainType: 'svm',
  nativeCurrency: { symbol: 'SOL', decimals: 9 },
  addressConfig: { format: 'base58' as const, patterns: [], example: '...' },
  endpoints: [{ url: 'https://sol.example.com', protocol: 'json-rpc' as const }],
}

type MockEvmClient = { type: 'evm-client' }
type MockSvmClient = { type: 'svm-client' }

const evmFactory: ReadClientFactory<MockEvmClient> = {
  chainType: 'evm',
  createClient: vi.fn(() => ({ type: 'evm-client' }) as MockEvmClient),
}

const svmFactory: ReadClientFactory<MockSvmClient> = {
  chainType: 'svm',
  createClient: vi.fn(() => ({ type: 'svm-client' }) as MockSvmClient),
}

describe('createReadClient', () => {
  it('returns a typed client for a valid chainId', () => {
    const registry = createChainRegistry([mockEvmChain])
    const client = createReadClient(evmFactory, registry, 1)
    expect(client).toEqual({ type: 'evm-client' })
  })

  it('returns null when chainId is not in registry', () => {
    const registry = createChainRegistry([mockEvmChain])
    const client = createReadClient(evmFactory, registry, 999)
    expect(client).toBeNull()
  })

  it('returns null when chain has no endpoints', () => {
    const chainNoEndpoints = { ...mockEvmChain, endpoints: undefined }
    const registry = createChainRegistry([chainNoEndpoints])
    const client = createReadClient(evmFactory, registry, 1)
    expect(client).toBeNull()
  })

  it('passes endpoint and chainId to factory.createClient', () => {
    const registry = createChainRegistry([mockEvmChain])
    createReadClient(evmFactory, registry, 1)
    expect(evmFactory.createClient).toHaveBeenCalledWith(mockEndpoint, 1)
  })
})

describe('resolveReadClient', () => {
  it('finds the correct factory by chainType and returns a client', () => {
    const registry = createChainRegistry([mockEvmChain, mockSvmChain])
    const factories: ReadClientFactory<unknown>[] = [evmFactory, svmFactory]

    const evmClient = resolveReadClient(factories, registry, 1)
    expect(evmClient).toEqual({ type: 'evm-client' })

    const svmClient = resolveReadClient(factories, registry, 'mainnet-beta')
    expect(svmClient).toEqual({ type: 'svm-client' })
  })

  it('returns null when no factory matches the chainType', () => {
    const registry = createChainRegistry([mockSvmChain])
    const factories: ReadClientFactory<unknown>[] = [evmFactory]

    const client = resolveReadClient(factories, registry, 'mainnet-beta')
    expect(client).toBeNull()
  })

  it('returns null when chainId is not in registry', () => {
    const registry = createChainRegistry([mockEvmChain])
    const factories: ReadClientFactory<unknown>[] = [evmFactory]

    const client = resolveReadClient(factories, registry, 999)
    expect(client).toBeNull()
  })
})
