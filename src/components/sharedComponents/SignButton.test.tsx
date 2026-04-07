import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SignButton from './SignButton'

const mockSwitchChain = vi.fn()
const mockSignMessage = vi.fn()

vi.mock('@/src/sdk/react/hooks', () => ({
  useWallet: vi.fn(() => ({
    adapter: {} as never,
    needsConnect: true,
    needsChainSwitch: false,
    isReady: false,
    status: { connected: false, connecting: false, activeAccount: null, connectedChainIds: [] },
    switchChain: mockSwitchChain,
    connect: vi.fn(),
    disconnect: vi.fn(),
    signMessage: mockSignMessage,
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

vi.mock('@/src/components/sharedComponents/ui/SwitchChainButton', () => ({
  default: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) =>
    createElement(
      'button',
      { type: 'button', 'data-testid': 'switch-chain-button', onClick },
      children,
    ),
}))

const { useWallet, useChainRegistry } = await import('@/src/sdk/react/hooks')
const mockedUseWallet = vi.mocked(useWallet)
const mockedUseChainRegistry = vi.mocked(useChainRegistry)

const system = createSystem(defaultConfig)
const renderWithChakra = (ui: ReactNode) =>
  render(<ChakraProvider value={system}>{ui}</ChakraProvider>)

const makeWalletReady = () =>
  mockedUseWallet.mockReturnValue({
    adapter: {} as never,
    needsConnect: false,
    needsChainSwitch: false,
    isReady: true,
    status: { connected: true, connecting: false, activeAccount: '0xabc', connectedChainIds: [1] },
    switchChain: mockSwitchChain,
    connect: vi.fn(),
    disconnect: vi.fn(),
    signMessage: mockSignMessage,
    getSigner: vi.fn(),
    adapterKey: 'evm',
    openConnectModal: vi.fn(),
    openAccountModal: vi.fn(),
  })

describe('SignButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignMessage.mockResolvedValue({ signature: '0xsig', address: '0xabc' })
  })

  it('renders connect button when wallet needsConnect', () => {
    renderWithChakra(<SignButton message="Hello" />)
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument()
    expect(screen.queryByText('Sign Message')).toBeNull()
  })

  it('renders custom fallback when provided and wallet needsConnect', () => {
    renderWithChakra(
      <SignButton
        message="Hello"
        fallback={createElement('div', { 'data-testid': 'custom-fallback' }, 'Custom')}
      />,
    )
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.queryByText('Sign Message')).toBeNull()
  })

  it('renders switch chain button when wallet needsChainSwitch', () => {
    mockedUseWallet.mockReturnValue({
      adapter: {} as never,
      needsConnect: false,
      needsChainSwitch: true,
      isReady: false,
      status: { connected: true, connecting: false, activeAccount: '0xabc', connectedChainIds: [] },
      switchChain: mockSwitchChain,
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: mockSignMessage,
      getSigner: vi.fn(),
      adapterKey: 'evm',
      openConnectModal: vi.fn(),
      openAccountModal: vi.fn(),
    })
    mockedUseChainRegistry.mockReturnValue({
      getChain: vi.fn(() => ({
        name: 'OP Mainnet',
        chainId: 10,
        chainType: 'evm',
        caip2Id: 'eip155:10',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        addressConfig: { format: 'hex' as const, patterns: [], example: '0x...' },
      })),
      getChainByCaip2: vi.fn(() => null),
      getChainType: vi.fn(() => null),
      getChainsByType: vi.fn(() => []),
      getAllChains: vi.fn(() => []),
    })
    renderWithChakra(
      <SignButton
        message="Hello"
        chainId={10}
      />,
    )
    expect(screen.getByTestId('switch-chain-button')).toBeInTheDocument()
    expect(screen.getByText(/Switch to/)).toBeInTheDocument()
    expect(screen.getByText(/OP Mainnet/)).toBeInTheDocument()
    expect(screen.queryByText('Sign Message')).toBeNull()
  })

  it('renders custom switchChainLabel when wallet needsChainSwitch', () => {
    mockedUseWallet.mockReturnValue({
      adapter: {} as never,
      needsConnect: false,
      needsChainSwitch: true,
      isReady: false,
      status: { connected: true, connecting: false, activeAccount: '0xabc', connectedChainIds: [] },
      switchChain: mockSwitchChain,
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: mockSignMessage,
      getSigner: vi.fn(),
      adapterKey: 'evm',
      openConnectModal: vi.fn(),
      openAccountModal: vi.fn(),
    })
    mockedUseChainRegistry.mockReturnValue({
      getChain: vi.fn(() => ({
        name: 'OP Mainnet',
        chainId: 10,
        chainType: 'evm',
        caip2Id: 'eip155:10',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        addressConfig: { format: 'hex' as const, patterns: [], example: '0x...' },
      })),
      getChainByCaip2: vi.fn(() => null),
      getChainType: vi.fn(() => null),
      getChainsByType: vi.fn(() => []),
      getAllChains: vi.fn(() => []),
    })
    renderWithChakra(
      <SignButton
        message="Hello"
        chainId={10}
        switchChainLabel="Change to"
      />,
    )
    expect(screen.getByText(/Change to/)).toBeInTheDocument()
  })

  it('renders sign button when wallet is ready', () => {
    makeWalletReady()
    renderWithChakra(<SignButton message="Hello" />)
    expect(screen.getByText('Sign Message')).toBeInTheDocument()
  })

  it('calls onSign with signature when signing succeeds', async () => {
    makeWalletReady()
    const onSign = vi.fn()
    renderWithChakra(
      <SignButton
        message="Hello"
        onSign={onSign}
      />,
    )
    await userEvent.click(screen.getByText('Sign Message'))
    expect(onSign).toHaveBeenCalledWith('0xsig')
  })

  it('calls onError when signing fails', async () => {
    makeWalletReady()
    mockSignMessage.mockRejectedValue(new Error('sign failed'))
    const onError = vi.fn()
    renderWithChakra(
      <SignButton
        message="Hello"
        onError={onError}
      />,
    )
    await userEvent.click(screen.getByText('Sign Message'))
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
  })
})
