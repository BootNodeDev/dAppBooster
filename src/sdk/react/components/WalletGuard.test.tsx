import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WalletGuard } from './WalletGuard'

const mockSwitchChain = vi.fn()

vi.mock('../hooks', () => ({
  useWallet: vi.fn(() => ({
    adapter: {} as never,
    needsConnect: true,
    needsChainSwitch: false,
    isReady: false,
    status: { connected: false, connecting: false, activeAccount: null, connectedChainIds: [] },
    switchChain: mockSwitchChain,
    connect: vi.fn(),
    disconnect: vi.fn(),
    signMessage: vi.fn(),
    getSigner: vi.fn(),
    adapterKey: 'evm',
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
}))

vi.mock('@/src/wallet/providers', () => ({
  ConnectWalletButton: () =>
    createElement(
      'button',
      { type: 'button', 'data-testid': 'connect-wallet-button' },
      'Connect Wallet',
    ),
}))

vi.mock('@/src/wallet/components/SwitchChainButton', () => ({
  default: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) =>
    createElement(
      'button',
      { type: 'button', 'data-testid': 'switch-chain-button', onClick },
      children,
    ),
}))

const { useWallet, useChainRegistry } = await import('../hooks')
const mockedUseWallet = vi.mocked(useWallet)
const mockedUseChainRegistry = vi.mocked(useChainRegistry)

const system = createSystem(defaultConfig)

const renderWithChakra = (ui: ReactNode) =>
  render(createElement(ChakraProvider, { value: system } as never, ui))

const makeWalletReady = () => ({
  adapter: {} as never,
  needsConnect: false,
  needsChainSwitch: false,
  isReady: true,
  status: { connected: true, connecting: false, activeAccount: '0xabc', connectedChainIds: [1] },
  switchChain: mockSwitchChain,
  connect: vi.fn(),
  disconnect: vi.fn(),
  signMessage: vi.fn(),
  getSigner: vi.fn(),
  adapterKey: 'evm',
  openConnectModal: vi.fn(),
  openAccountModal: vi.fn(),
})

describe('WalletGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders fallback when wallet needsConnect', () => {
    renderWithChakra(
      createElement(
        WalletGuard,
        null,
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })

  it('renders custom fallback when provided and needsConnect', () => {
    renderWithChakra(
      createElement(
        WalletGuard,
        { fallback: createElement('div', { 'data-testid': 'custom-fallback' }, 'Custom') },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })

  it('renders switch chain button when needsChainSwitch', () => {
    mockedUseWallet.mockReturnValue({
      ...makeWalletReady(),
      needsConnect: false,
      needsChainSwitch: true,
      isReady: false,
    })

    mockedUseChainRegistry.mockReturnValue({
      getChain: vi.fn(() => ({
        name: 'OP Mainnet',
        chainId: 10,
        caip2Id: 'eip155:10',
        chainType: 'evm',
        nativeCurrency: { symbol: 'ETH', decimals: 18 },
        addressConfig: { format: 'hex' as const, patterns: [], example: '0x...' },
      })),
      getChainByCaip2: vi.fn(() => null),
      getChainType: vi.fn(() => null),
      getChainsByType: vi.fn(() => []),
      getAllChains: vi.fn(() => []),
    })

    renderWithChakra(
      createElement(
        WalletGuard,
        { chainId: 10 },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('switch-chain-button')).toBeInTheDocument()
    expect(screen.getByText(/Switch to/)).toBeInTheDocument()
    expect(screen.getByText(/OP Mainnet/)).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })

  it('renders children when wallet is ready', () => {
    mockedUseWallet.mockReturnValue(makeWalletReady())

    renderWithChakra(
      createElement(
        WalletGuard,
        null,
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('renders children with custom chainId when wallet is ready', () => {
    mockedUseWallet.mockReturnValue({
      ...makeWalletReady(),
      status: {
        connected: true,
        connecting: false,
        activeAccount: '0xabc',
        connectedChainIds: [10],
      },
    })

    renderWithChakra(
      createElement(
        WalletGuard,
        { chainId: 10 },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
})
