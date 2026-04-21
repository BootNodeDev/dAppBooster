import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Web3Status } from '@/src/hooks/useWeb3Status'
import { useWeb3StatusConnected, WalletStatusVerifier } from './WalletStatusVerifier'

const mockSwitchChain = vi.fn()

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

vi.mock('@/src/hooks/useWalletStatus', () => ({
  useWalletStatus: vi.fn(() => ({
    isReady: false,
    needsConnect: true,
    needsChainSwitch: false,
    targetChain: { id: 1, name: 'Ethereum' },
    targetChainId: 1,
    switchChain: mockSwitchChain,
    web3Status: mockWeb3Status,
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

const { useWalletStatus } = await import('@/src/hooks/useWalletStatus')
const mockedUseWalletStatus = vi.mocked(useWalletStatus)

const system = createSystem(defaultConfig)

const renderWithChakra = (ui: ReactNode) =>
  render(<ChakraProvider value={system}>{ui}</ChakraProvider>)

describe('WalletStatusVerifier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders default fallback (ConnectWalletButton) when wallet needs connect', () => {
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
      createElement(
        WalletStatusVerifier,
        null,
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).toBeNull()
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
      createElement(
        WalletStatusVerifier,
        { fallback: createElement('div', { 'data-testid': 'custom-fallback' }, 'Custom') },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).toBeNull()
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

    renderWithChakra(
      createElement(
        WalletStatusVerifier,
        null,
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByText(/Switch to/)).toBeInTheDocument()
    expect(screen.getByText(/OP Mainnet/)).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })

  it('renders children when wallet is ready', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: true,
      needsConnect: false,
      needsChainSwitch: false,
      targetChain: { id: 1, name: 'Ethereum' } as ReturnType<typeof useWalletStatus>['targetChain'],
      targetChainId: 1,
      switchChain: mockSwitchChain,
      web3Status: mockWeb3Status,
    })

    renderWithChakra(
      createElement(
        WalletStatusVerifier,
        null,
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('calls switchChain when switch button is clicked', async () => {
    const user = userEvent.setup()

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

    renderWithChakra(
      createElement(WalletStatusVerifier, null, createElement('div', null, 'Protected')),
    )

    const switchButton = screen.getByText(/Switch to/)
    await user.click(switchButton)

    expect(mockSwitchChain).toHaveBeenCalledWith(10)
  })

  it('provides web3 status context to children when wallet is ready', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: true,
      needsConnect: false,
      needsChainSwitch: false,
      targetChain: { id: 1, name: 'Ethereum' } as ReturnType<typeof useWalletStatus>['targetChain'],
      targetChainId: 1,
      switchChain: mockSwitchChain,
      web3Status: mockWeb3Status,
    })

    const ChildComponent = () => {
      const { address } = useWeb3StatusConnected()
      return createElement('div', { 'data-testid': 'address' }, address)
    }

    renderWithChakra(createElement(WalletStatusVerifier, null, createElement(ChildComponent)))

    expect(screen.getByTestId('address')).toHaveTextContent('0xdeadbeef')
  })
})
