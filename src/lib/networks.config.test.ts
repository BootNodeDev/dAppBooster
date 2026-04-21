import { arbitrum, mainnet, optimism, optimismSepolia, polygon, sepolia } from 'viem/chains'
import { describe, expect, it, vi } from 'vitest'

const CUSTOM_ARBITRUM_RPC = 'https://custom.example/arbitrum'

vi.mock('@/src/env', () => ({
  env: {
    PUBLIC_APP_NAME: 'test',
    PUBLIC_INCLUDE_TESTNETS: true,
    PUBLIC_RPC_ARBITRUM: CUSTOM_ARBITRUM_RPC,
  },
}))

vi.mock('@/src/constants/common', () => ({
  includeTestnets: true,
}))

const { chains, rpcUrls, lifiRpcUrls } = await import('@/src/lib/networks.config')

const ALL_CHAIN_IDS = [
  mainnet.id,
  arbitrum.id,
  optimism.id,
  optimismSepolia.id,
  polygon.id,
  sepolia.id,
]

describe('rpcUrls', () => {
  it('covers every configured chain', () => {
    for (const id of ALL_CHAIN_IDS) {
      expect(rpcUrls).toHaveProperty(String(id))
      expect(typeof rpcUrls[id as keyof typeof rpcUrls]).toBe('string')
      expect(rpcUrls[id as keyof typeof rpcUrls].length).toBeGreaterThan(0)
    }
  })

  it('uses the env-supplied URL when set', () => {
    expect(rpcUrls[arbitrum.id]).toBe(CUSTOM_ARBITRUM_RPC)
  })

  it('falls back to publicnode.com when env var is absent', () => {
    expect(rpcUrls[mainnet.id]).toContain('publicnode.com')
    expect(rpcUrls[optimism.id]).toContain('publicnode.com')
    expect(rpcUrls[polygon.id]).toContain('publicnode.com')
  })
})

describe('lifiRpcUrls', () => {
  it('covers the same chain IDs as rpcUrls', () => {
    const rpcKeys = Object.keys(rpcUrls).map(Number).sort()
    const lifiKeys = Object.keys(lifiRpcUrls).map(Number).sort()
    expect(lifiKeys).toEqual(rpcKeys)
  })

  it('wraps each rpcUrls value in a single-element array', () => {
    for (const id of ALL_CHAIN_IDS) {
      const lifiEntry = lifiRpcUrls[id as keyof typeof lifiRpcUrls]
      expect(Array.isArray(lifiEntry)).toBe(true)
      expect(lifiEntry).toHaveLength(1)
      expect(lifiEntry[0]).toBe(rpcUrls[id as keyof typeof rpcUrls])
    }
  })

  it('propagates the env-supplied URL', () => {
    expect(lifiRpcUrls[arbitrum.id]).toEqual([CUSTOM_ARBITRUM_RPC])
  })
})

describe('chains', () => {
  it('contains all chain IDs covered by rpcUrls when testnets enabled', () => {
    const chainIds = chains.map((c) => c.id)
    for (const id of ALL_CHAIN_IDS) {
      expect(chainIds).toContain(id)
    }
  })
})
