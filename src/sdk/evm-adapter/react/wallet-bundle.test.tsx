import { render, screen } from '@testing-library/react'
import type { FC, ReactNode } from 'react'
import { createElement } from 'react'
import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { createConfig } from 'wagmi'
import { mock } from 'wagmi/connectors'

import type { EvmConnectorConfig } from './types'
import { createEvmWalletBundle } from './wallet-bundle'

const TEST_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const

const MockWalletProvider: FC<{ children: ReactNode }> = ({ children }) =>
  createElement('div', { 'data-testid': 'mock-wallet-provider' }, children)

const mockUseConnectModal = () => ({ open: () => {} })

const testConnector: EvmConnectorConfig = {
  createConfig(chains, transports) {
    return createConfig({
      chains: chains as [typeof mainnet],
      transports,
      connectors: [mock({ accounts: [TEST_ADDRESS] })],
    })
  },
  WalletProvider: MockWalletProvider,
  useConnectModal: mockUseConnectModal,
}

describe('createEvmWalletBundle', () => {
  it('returns a bundle with adapter, Provider, useConnectModal, and readClientFactory', () => {
    const bundle = createEvmWalletBundle({
      connector: testConnector,
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    expect(bundle.adapter).toBeDefined()
    expect(bundle.Provider).toBeDefined()
    expect(bundle.useConnectModal).toBeDefined()
    expect(bundle.readClientFactory).toBeDefined()
  })

  it('adapter has chainType "evm"', () => {
    const bundle = createEvmWalletBundle({
      connector: testConnector,
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    expect(bundle.adapter.chainType).toBe('evm')
  })

  it('readClientFactory has chainType "evm"', () => {
    const bundle = createEvmWalletBundle({
      connector: testConnector,
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    expect(bundle.readClientFactory?.chainType).toBe('evm')
  })

  it('Provider renders children through the wagmi + query + connector provider stack', () => {
    const bundle = createEvmWalletBundle({
      connector: testConnector,
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    const BundleProvider = bundle.Provider!

    render(
      createElement(
        BundleProvider,
        null,
        createElement('div', { 'data-testid': 'child-content' }, 'Hello from child'),
      ),
    )

    expect(screen.getByTestId('child-content')).toHaveTextContent('Hello from child')
    expect(screen.getByTestId('mock-wallet-provider')).toBeInTheDocument()
  })

  it('throws when chains is empty', () => {
    expect(() =>
      createEvmWalletBundle({
        connector: testConnector,
        chains: [],
        transports: {},
      }),
    ).toThrow('createEvmWalletAdapter requires at least one chain')
  })
})
