import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Web3Status } from '@/src/hooks/useWeb3Status'
import SignButton from './SignButton'

const mockSwitchChain = vi.fn()
const mockSignMessageAsync = vi.fn()
const mockWatchSignature = vi.fn()

vi.mock('@/src/hooks/useWalletStatus', () => ({
  useWalletStatus: vi.fn(() => ({
    isReady: false,
    needsConnect: true,
    needsChainSwitch: false,
    targetChain: { id: 1, name: 'Ethereum' },
    targetChainId: 1,
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
    watchSignature: mockWatchSignature,
  })),
}))

vi.mock('wagmi', () => ({
  useSignMessage: vi.fn(() => ({
    isPending: false,
    signMessageAsync: mockSignMessageAsync,
  })),
}))

const { useWalletStatus } = await import('@/src/hooks/useWalletStatus')
const mockedUseWalletStatus = vi.mocked(useWalletStatus)

const mockWeb3Status = {
  readOnlyClient: undefined,
  appChainId: 1,
  address: '0xdeadbeef',
  balance: undefined,
  connectingWallet: false,
  switchingChain: false,
  isWalletConnected: true,
  walletClient: undefined,
  isWalletSynced: true,
  walletChainId: 1,
  switchChain: vi.fn(),
  disconnect: vi.fn(),
} as unknown as Web3Status

const system = createSystem(defaultConfig)

const renderWithChakra = (ui: ReactNode) =>
  render(<ChakraProvider value={system}>{ui}</ChakraProvider>)

describe('SignButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders connect button when wallet needs connect', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: false,
      needsConnect: true,
      needsChainSwitch: false,
      targetChain: { id: 1, name: 'Ethereum' } as ReturnType<typeof useWalletStatus>['targetChain'],
      targetChainId: 1,
      switchChain: mockSwitchChain,
      web3Status: mockWeb3Status,
    })

    renderWithChakra(<SignButton message="Hello" />)

    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument()
    expect(screen.queryByText('Sign Message')).toBeNull()
  })

  it('renders custom fallback when provided and wallet needs connect', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: false,
      needsConnect: true,
      needsChainSwitch: false,
      targetChain: { id: 1, name: 'Ethereum' } as ReturnType<typeof useWalletStatus>['targetChain'],
      targetChainId: 1,
      switchChain: mockSwitchChain,
      web3Status: mockWeb3Status,
    })

    renderWithChakra(
      <SignButton
        message="Hello"
        fallback={createElement('div', { 'data-testid': 'custom-fallback' }, 'Custom')}
      />,
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.queryByText('Sign Message')).toBeNull()
  })

  it('renders switch chain button when wallet needs chain switch', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: false,
      needsConnect: false,
      needsChainSwitch: true,
      targetChain: { id: 10, name: 'OP Mainnet' } as ReturnType<
        typeof useWalletStatus
      >['targetChain'],
      targetChainId: 10,
      switchChain: mockSwitchChain,
      web3Status: mockWeb3Status,
    })

    renderWithChakra(<SignButton message="Hello" />)

    expect(screen.getByText(/Switch to/)).toBeInTheDocument()
    expect(screen.getByText(/OP Mainnet/)).toBeInTheDocument()
    expect(screen.queryByText('Sign Message')).toBeNull()
  })

  it('renders sign button when wallet is ready', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: true,
      needsConnect: false,
      needsChainSwitch: false,
      targetChain: { id: 1, name: 'Ethereum' } as ReturnType<typeof useWalletStatus>['targetChain'],
      targetChainId: 1,
      switchChain: mockSwitchChain,
      web3Status: mockWeb3Status,
    })

    renderWithChakra(<SignButton message="Hello" />)

    expect(screen.getByText('Sign Message')).toBeInTheDocument()
  })
})
