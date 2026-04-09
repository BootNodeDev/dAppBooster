import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'

import type { ConnectorAppMetadata } from '../types'
import { createConnectkitConnector } from './connectkit'
import { createRainbowkitConnector } from './rainbowkit'
import { createReownConnector } from './reown'

const testMetadata: ConnectorAppMetadata = {
  appName: 'Test App',
  walletConnectProjectId: 'test-project-id',
}

describe('createConnectkitConnector', () => {
  it('returns an EvmConnectorConfig with createConfig, WalletProvider, useConnectModal', () => {
    const connector = createConnectkitConnector(testMetadata)
    expect(typeof connector.createConfig).toBe('function')
    expect(typeof connector.WalletProvider).toBe('function')
    expect(typeof connector.useConnectModal).toBe('function')
  })

  it('createConfig returns a wagmi Config containing the supplied chain', () => {
    const connector = createConnectkitConnector(testMetadata)
    const config = connector.createConfig([mainnet], { [mainnet.id]: http() })
    expect(config.chains).toContain(mainnet)
  })
})

describe('createRainbowkitConnector', () => {
  it('returns an EvmConnectorConfig with createConfig, WalletProvider, useConnectModal', () => {
    const connector = createRainbowkitConnector(testMetadata)
    expect(typeof connector.createConfig).toBe('function')
    expect(typeof connector.WalletProvider).toBe('function')
    expect(typeof connector.useConnectModal).toBe('function')
  })

  it('createConfig returns a wagmi Config containing the supplied chain', () => {
    const connector = createRainbowkitConnector(testMetadata)
    const config = connector.createConfig([mainnet], { [mainnet.id]: http() })
    expect(config.chains).toContain(mainnet)
  })
})

describe('createReownConnector', () => {
  it('returns an EvmConnectorConfig with createConfig, WalletProvider, useConnectModal', () => {
    const connector = createReownConnector(testMetadata)
    expect(typeof connector.createConfig).toBe('function')
    expect(typeof connector.WalletProvider).toBe('function')
    expect(typeof connector.useConnectModal).toBe('function')
  })

  it('createConfig returns a wagmi Config containing the supplied chain id', () => {
    const connector = createReownConnector(testMetadata)
    const config = connector.createConfig([mainnet], { [mainnet.id]: http() })
    expect(config.chains).toContainEqual(expect.objectContaining({ id: mainnet.id }))
  })
})
