import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import signMessage from './index'

const system = createSystem(defaultConfig)

vi.mock('@/src/sdk/react/hooks', () => ({
  useWallet: vi.fn(() => ({
    adapter: {} as never,
    adapterKey: 'evm',
    status: {
      connected: false,
      activeAccount: null,
      connectedChainIds: [],
      connecting: false,
    },
    isReady: false,
    needsConnect: true,
    needsChainSwitch: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    signMessage: vi.fn(),
    getSigner: vi.fn(),
    switchChain: vi.fn(),
    openConnectModal: vi.fn(),
    openAccountModal: vi.fn(),
  })),
  useChainRegistry: vi.fn(() => ({
    getChain: vi.fn(() => null),
    getChainByCaip2: vi.fn(() => null),
    getChainType: vi.fn(() => null),
    getChainsByType: vi.fn(() => []),
    getAllChains: vi.fn(() => []),
  })),
  useMultiWallet: vi.fn(() => ({
    wallets: {},
    getWallet: vi.fn(() => undefined),
    getWalletByChainId: vi.fn(() => undefined),
    connectedAddresses: {},
  })),
}))

vi.mock('@/src/wallet/providers', () => ({
  ConnectWalletButton: () => <button type="button">Connect Wallet</button>,
}))

describe('SignMessage demo', () => {
  it('renders connect wallet fallback when wallet not connected', () => {
    render(<ChakraProvider value={system}>{signMessage.demo}</ChakraProvider>)
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeDefined()
  })
})
