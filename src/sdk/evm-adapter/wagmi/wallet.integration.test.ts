/**
 * Integration tests for createEvmWalletAdapter.
 * Uses real wagmi config with the wagmi mock connector — no module mocking.
 */

import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { createConfig } from 'wagmi'
import { mock } from 'wagmi/connectors'

import type { WalletStatus } from '../../core/adapters/wallet'
import type { EvmCoreConnectorConfig } from '../types'
import { createEvmWalletAdapter } from './wallet'

const TEST_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const

const stubCoreConnector: EvmCoreConnectorConfig = {
  createConfig(chains, transports) {
    return createConfig({
      chains: chains as [typeof mainnet],
      transports,
    })
  },
}

function makeRealConfig() {
  return createConfig({
    chains: [mainnet],
    transports: { [mainnet.id]: http() },
    connectors: [mock({ accounts: [TEST_ADDRESS] })],
  })
}

describe('createEvmWalletAdapter — integration tests', () => {
  it('connect → getStatus → disconnect lifecycle', async () => {
    const wagmiConfig = makeRealConfig()
    const adapter = createEvmWalletAdapter({
      coreConnector: stubCoreConnector,
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
      wagmiConfig,
    })

    expect(adapter.getStatus().connected).toBe(false)

    await adapter.connect()
    expect(adapter.getStatus().connected).toBe(true)
    expect(adapter.getStatus().activeAccount?.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase())

    await adapter.disconnect()
    expect(adapter.getStatus().connected).toBe(false)
  })

  it('onStatusChange subscription fires on connect', async () => {
    const wagmiConfig = makeRealConfig()
    const adapter = createEvmWalletAdapter({
      coreConnector: stubCoreConnector,
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
      wagmiConfig,
    })

    const statuses: WalletStatus[] = []
    const unsubscribe = adapter.onStatusChange((status) => statuses.push(status))

    await adapter.connect()
    unsubscribe()

    expect(statuses.length).toBeGreaterThan(0)
    expect(statuses[statuses.length - 1].connected).toBe(true)
  })
})
