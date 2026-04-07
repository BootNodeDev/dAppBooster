import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeveloperError } from '@/src/core/utils/DeveloperError'
import { useWeb3StatusConnected, WalletStatusVerifier } from './WalletStatusVerifier'

const mockSwitchChain = vi.fn()

vi.mock('@/src/wallet/hooks/useWalletStatus', () => ({
  useWalletStatus: vi.fn(() => ({
    isReady: false,
    needsConnect: true,
    needsChainSwitch: false,
    targetChain: { id: 1, name: 'Ethereum' },
    targetChainId: 1,
    switchChain: mockSwitchChain,
  })),
}))

vi.mock('@/src/wallet/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(() => ({
    address: '0x1234567890abcdef1234567890abcdef12345678',
    appChainId: 1,
    balance: undefined,
    connectingWallet: false,
    disconnect: vi.fn(),
    isWalletConnected: true,
    isWalletSynced: true,
    readOnlyClient: {},
    switchChain: vi.fn(),
    switchingChain: false,
    walletChainId: 1,
    walletClient: {},
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

const { useWalletStatus } = await import('@/src/wallet/hooks/useWalletStatus')
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
    })

    renderWithChakra(
      createElement(WalletStatusVerifier, null, createElement('div', null, 'Protected')),
    )

    const switchButton = screen.getByText(/Switch to/)
    await user.click(switchButton)

    expect(mockSwitchChain).toHaveBeenCalledWith(10)
  })

  it('provides web3 status via context when wallet is ready', () => {
    mockedUseWalletStatus.mockReturnValue({
      isReady: true,
      needsConnect: false,
      needsChainSwitch: false,
      targetChain: { id: 1, name: 'Ethereum' } as ReturnType<typeof useWalletStatus>['targetChain'],
      targetChainId: 1,
      switchChain: mockSwitchChain,
    })

    const Consumer = () => {
      const { address } = useWeb3StatusConnected()
      return createElement('div', { 'data-testid': 'address' }, address)
    }

    renderWithChakra(createElement(WalletStatusVerifier, null, createElement(Consumer)))

    expect(screen.getByTestId('address')).toHaveTextContent(
      '0x1234567890abcdef1234567890abcdef12345678',
    )
  })

  it('throws DeveloperError when useWeb3StatusConnected is used outside WalletStatusVerifier', () => {
    const Consumer = () => {
      const { address } = useWeb3StatusConnected()
      return createElement('div', null, address)
    }

    expect(() => renderWithChakra(createElement(Consumer))).toThrow(DeveloperError)
  })
})
