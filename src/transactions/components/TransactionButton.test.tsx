import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TransactionButton from './TransactionButton'

const mockSwitchChain = vi.fn()
const mockExecute = vi.fn(async () => ({
  status: 'success' as const,
  ref: { chainType: 'evm', id: '0xabc', chainId: 1 },
  receipt: {},
}))

vi.mock('@/src/sdk/react/hooks', () => ({
  useWallet: vi.fn(() => ({
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
    adapter: {} as never,
  })),
  useTransaction: vi.fn(() => ({
    phase: 'idle',
    execute: mockExecute,
    reset: vi.fn(),
    prepareResult: null,
    ref: null,
    result: null,
    preStepResults: [],
    explorerUrl: null,
    error: null,
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

vi.mock('@/src/wallet/components', () => ({
  SwitchChainButton: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) =>
    createElement(
      'button',
      { type: 'button', 'data-testid': 'switch-chain-button', onClick },
      children,
    ),
}))

const { useWallet, useTransaction, useChainRegistry } = await import('@/src/sdk/react/hooks')
const mockedUseWallet = vi.mocked(useWallet)
const mockedUseTransaction = vi.mocked(useTransaction)
const mockedUseChainRegistry = vi.mocked(useChainRegistry)

const system = createSystem(defaultConfig)
const renderWithChakra = (ui: ReactNode) =>
  render(<ChakraProvider value={system}>{ui}</ChakraProvider>)

const testParams = { chainId: 1, payload: { to: '0x1234', value: '0' } }

const makeWalletReady = () =>
  mockedUseWallet.mockReturnValue({
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
    adapter: {} as never,
  })

describe('TransactionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExecute.mockResolvedValue({
      status: 'success' as const,
      ref: { chainType: 'evm', id: '0xabc', chainId: 1 },
      receipt: {},
    })
  })

  it('renders connect button when wallet needsConnect', () => {
    mockedUseWallet.mockReturnValue({
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
      adapter: {} as never,
    })

    renderWithChakra(<TransactionButton params={testParams}>Send</TransactionButton>)

    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument()
    expect(screen.queryByText('Send')).toBeNull()
  })

  it('renders custom fallback when provided and wallet needsConnect', () => {
    mockedUseWallet.mockReturnValue({
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
      adapter: {} as never,
    })

    renderWithChakra(
      <TransactionButton
        params={testParams}
        fallback={createElement('div', { 'data-testid': 'custom-fallback' }, 'Custom')}
      >
        Send
      </TransactionButton>,
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.queryByText('Send')).toBeNull()
  })

  it('renders switch chain button when wallet needsChainSwitch', () => {
    mockedUseWallet.mockReturnValue({
      needsConnect: false,
      needsChainSwitch: true,
      isReady: false,
      status: {
        connected: true,
        connecting: false,
        activeAccount: '0xabc',
        connectedChainIds: [1],
      },
      switchChain: mockSwitchChain,
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      getSigner: vi.fn(),
      adapterKey: 'evm',
      openConnectModal: vi.fn(),
      openAccountModal: vi.fn(),
      adapter: {} as never,
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

    renderWithChakra(<TransactionButton params={testParams}>Send</TransactionButton>)

    expect(screen.getByTestId('switch-chain-button')).toBeInTheDocument()
    expect(screen.getByText(/Switch to/)).toBeInTheDocument()
    expect(screen.getByText(/OP Mainnet/)).toBeInTheDocument()
    expect(screen.queryByText('Send')).toBeNull()
  })

  it('renders switch chain label with chain name', () => {
    mockedUseWallet.mockReturnValue({
      needsConnect: false,
      needsChainSwitch: true,
      isReady: false,
      status: {
        connected: true,
        connecting: false,
        activeAccount: '0xabc',
        connectedChainIds: [1],
      },
      switchChain: mockSwitchChain,
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      getSigner: vi.fn(),
      adapterKey: 'evm',
      openConnectModal: vi.fn(),
      openAccountModal: vi.fn(),
      adapter: {} as never,
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
      <TransactionButton
        params={testParams}
        switchChainLabel="Change to"
      >
        Send
      </TransactionButton>,
    )

    expect(screen.getByText(/Change to/)).toBeInTheDocument()
    expect(screen.getByText(/OP Mainnet/)).toBeInTheDocument()
  })

  it('renders transaction button when wallet is ready', () => {
    makeWalletReady()

    renderWithChakra(<TransactionButton params={testParams}>Send ETH</TransactionButton>)

    expect(screen.getByText('Send ETH')).toBeInTheDocument()
    expect(screen.queryByTestId('connect-wallet-button')).toBeNull()
  })

  it('shows labelSending when phase is not idle', () => {
    makeWalletReady()
    mockedUseTransaction.mockReturnValue({
      phase: 'submit',
      execute: mockExecute,
      reset: vi.fn(),
      prepareResult: null,
      ref: null,
      result: null,
      preStepResults: [],
      explorerUrl: null,
      error: null,
    })

    renderWithChakra(<TransactionButton params={testParams}>Send ETH</TransactionButton>)

    expect(screen.getByText('Sending...')).toBeInTheDocument()
    expect(screen.queryByText('Send ETH')).toBeNull()
  })

  it('is disabled when disabled prop passed', () => {
    makeWalletReady()
    mockedUseTransaction.mockReturnValue({
      phase: 'idle',
      execute: mockExecute,
      reset: vi.fn(),
      prepareResult: null,
      ref: null,
      result: null,
      preStepResults: [],
      explorerUrl: null,
      error: null,
    })

    renderWithChakra(
      <TransactionButton
        params={testParams}
        disabled
      >
        Send ETH
      </TransactionButton>,
    )

    const button = screen.getByText('Send ETH').closest('button')
    expect(button).toBeDefined()
    expect(button?.disabled).toBe(true)
  })
})
