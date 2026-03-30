import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { type ReactNode, createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TransactionButton from './TransactionButton'

const mockSwitchChain = vi.fn()
const mockWatchTx = vi.fn()
const mockTransaction = vi.fn(() => Promise.resolve('0xabc' as `0x${string}`))

vi.mock('@/src/hooks/useWalletStatus', () => ({
  useWalletStatus: vi.fn(() => ({
    isReady: false,
    needsConnect: true,
    needsChainSwitch: false,
    targetChain: { id: 1, name: 'Ethereum' },
    switchChain: mockSwitchChain,
  })),
}))

vi.mock('@/src/providers/Web3Provider', () => ({
  ConnectWalletButton: () =>
    createElement(
      'button',
      { type: 'button', 'data-testid': 'connect-wallet-button' },
      'Connect Wallet',
    ),
}))

vi.mock('@/src/providers/TransactionNotificationProvider', () => ({
  useTransactionNotification: vi.fn(() => ({
    watchTx: mockWatchTx,
  })),
}))

vi.mock('wagmi', () => ({
  useWaitForTransactionReceipt: vi.fn(() => ({
    data: undefined,
  })),
}))

const { useWalletStatus } = await import('@/src/hooks/useWalletStatus')
const mockedUseWalletStatus = vi.mocked(useWalletStatus)

const system = createSystem(defaultConfig)

const renderWithChakra = (ui: ReactNode) =>
  render(<ChakraProvider value={system}>{ui}</ChakraProvider>)

describe('TransactionButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders connect button when wallet needs connect', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: false,
      needsConnect: true,
      needsChainSwitch: false,
      targetChain: { id: 1, name: 'Ethereum' } as ReturnType<typeof useWalletStatus>['targetChain'],
      switchChain: mockSwitchChain,
    })

    renderWithChakra(<TransactionButton transaction={mockTransaction}>Send</TransactionButton>)

    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument()
    expect(screen.queryByText('Send')).toBeNull()
  })

  it('renders custom fallback when provided and wallet needs connect', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: false,
      needsConnect: true,
      needsChainSwitch: false,
      targetChain: { id: 1, name: 'Ethereum' } as ReturnType<typeof useWalletStatus>['targetChain'],
      switchChain: mockSwitchChain,
    })

    renderWithChakra(
      <TransactionButton
        transaction={mockTransaction}
        fallback={createElement('div', { 'data-testid': 'custom-fallback' }, 'Custom')}
      >
        Send
      </TransactionButton>,
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.queryByText('Send')).toBeNull()
  })

  it('renders switch chain button when wallet needs chain switch', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: false,
      needsConnect: false,
      needsChainSwitch: true,
      targetChain: { id: 10, name: 'OP Mainnet' } as ReturnType<
        typeof useWalletStatus
      >['targetChain'],
      switchChain: mockSwitchChain,
    })

    renderWithChakra(<TransactionButton transaction={mockTransaction}>Send</TransactionButton>)

    expect(screen.getByText(/Switch to/)).toBeInTheDocument()
    expect(screen.getByText(/OP Mainnet/)).toBeInTheDocument()
    expect(screen.queryByText('Send')).toBeNull()
  })

  it('renders custom switch chain label when provided', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: false,
      needsConnect: false,
      needsChainSwitch: true,
      targetChain: { id: 10, name: 'OP Mainnet' } as ReturnType<
        typeof useWalletStatus
      >['targetChain'],
      switchChain: mockSwitchChain,
    })

    renderWithChakra(
      <TransactionButton
        transaction={mockTransaction}
        switchChainLabel="Change to"
      >
        Send
      </TransactionButton>,
    )

    expect(screen.getByText(/Change to/)).toBeInTheDocument()
    expect(screen.getByText(/OP Mainnet/)).toBeInTheDocument()
  })

  it('renders transaction button when wallet is ready', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: true,
      needsConnect: false,
      needsChainSwitch: false,
      targetChain: { id: 1, name: 'Ethereum' } as ReturnType<typeof useWalletStatus>['targetChain'],
      switchChain: mockSwitchChain,
    })

    renderWithChakra(<TransactionButton transaction={mockTransaction}>Send ETH</TransactionButton>)

    expect(screen.getByText('Send ETH')).toBeInTheDocument()
    expect(screen.queryByTestId('connect-wallet-button')).toBeNull()
  })
})
