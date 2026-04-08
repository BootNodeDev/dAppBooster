import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'

import { connectkitConnector } from './connectkit'
import { rainbowkitConnector } from './rainbowkit'
import { reownConnector } from './reown'

describe('connectkitConnector', () => {
  it('createConfig returns a wagmi Config containing the supplied chain', () => {
    const config = connectkitConnector.createConfig([mainnet], { [mainnet.id]: http() })
    expect(config.chains).toContain(mainnet)
  })

  it('WalletProvider is a function', () => {
    expect(typeof connectkitConnector.WalletProvider).toBe('function')
  })

  it('useConnectModal is a function', () => {
    expect(typeof connectkitConnector.useConnectModal).toBe('function')
  })
})

describe('rainbowkitConnector', () => {
  it('createConfig returns a wagmi Config containing the supplied chain', () => {
    const config = rainbowkitConnector.createConfig([mainnet], { [mainnet.id]: http() })
    expect(config.chains).toContain(mainnet)
  })

  it('WalletProvider is a function', () => {
    expect(typeof rainbowkitConnector.WalletProvider).toBe('function')
  })

  it('useConnectModal is a function', () => {
    expect(typeof rainbowkitConnector.useConnectModal).toBe('function')
  })
})

describe('reownConnector', () => {
  it('createConfig returns a wagmi Config containing the supplied chain id', () => {
    const config = reownConnector.createConfig([mainnet], { [mainnet.id]: http() })
    // Reown's WagmiAdapter wraps chains with extra fields (chainNamespace, caipNetworkId, assets),
    // so reference equality fails — assert by chain id instead.
    expect(config.chains).toContainEqual(expect.objectContaining({ id: mainnet.id }))
  })

  it('WalletProvider is a function', () => {
    expect(typeof reownConnector.WalletProvider).toBe('function')
  })

  it('useConnectModal is a function', () => {
    expect(typeof reownConnector.useConnectModal).toBe('function')
  })
})
