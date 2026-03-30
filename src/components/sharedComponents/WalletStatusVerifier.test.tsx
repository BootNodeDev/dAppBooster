import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WalletStatusVerifier, withWalletStatusVerifier } from './WalletStatusVerifier'

const system = createSystem(defaultConfig)

vi.mock('@/src/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(),
}))

vi.mock('@/src/providers/Web3Provider', () => ({
  ConnectWalletButton: () => <button type="button">Connect Wallet</button>,
}))

import * as useWeb3StatusModule from '@/src/hooks/useWeb3Status'

// chains[0] = optimismSepolia (id: 11155420) when PUBLIC_INCLUDE_TESTNETS=true (default)
const OP_SEPOLIA_ID = 11155420 as const

function connectedSyncedStatus(overrides = {}) {
  return {
    isWalletConnected: true,
    isWalletSynced: true,
    walletChainId: OP_SEPOLIA_ID,
    appChainId: OP_SEPOLIA_ID,
    switchChain: vi.fn(),
    disconnect: vi.fn(),
    address: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
    balance: undefined,
    connectingWallet: false,
    switchingChain: false,
    walletClient: undefined,
    readOnlyClient: undefined,
    ...overrides,
  }
}

function wrap(ui: React.ReactElement) {
  return render(<ChakraProvider value={system}>{ui}</ChakraProvider>)
}

describe('WalletStatusVerifier', () => {
  it('renders default ConnectWalletButton fallback when wallet not connected', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      connectedSyncedStatus({ isWalletConnected: false, isWalletSynced: false }) as any,
    )
    wrap(
      <WalletStatusVerifier>
        <div>Protected Content</div>
      </WalletStatusVerifier>,
    )
    expect(screen.getByText('Connect Wallet')).toBeDefined()
    expect(screen.queryByText('Protected Content')).toBeNull()
  })

  it('renders custom fallback when wallet not connected', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      connectedSyncedStatus({ isWalletConnected: false, isWalletSynced: false }) as any,
    )
    wrap(
      <WalletStatusVerifier fallback={<div>Custom Fallback</div>}>
        <div>Protected Content</div>
      </WalletStatusVerifier>,
    )
    expect(screen.getByText('Custom Fallback')).toBeDefined()
  })

  it('renders switch chain button when wallet is on wrong chain', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      connectedSyncedStatus({ isWalletSynced: false, walletChainId: 1 }) as any,
    )
    wrap(
      <WalletStatusVerifier>
        <div>Protected Content</div>
      </WalletStatusVerifier>,
    )
    expect(screen.getByRole('button').textContent?.toLowerCase()).toContain('switch to')
    expect(screen.queryByText('Protected Content')).toBeNull()
  })

  it('renders children when wallet is connected and synced', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      connectedSyncedStatus() as any,
    )
    wrap(
      <WalletStatusVerifier>
        <div>Protected Content</div>
      </WalletStatusVerifier>,
    )
    expect(screen.getByText('Protected Content')).toBeDefined()
  })
})

describe('withWalletStatusVerifier HOC', () => {
  const ProtectedComponent = () => <div>Protected Component</div>
  const Wrapped = withWalletStatusVerifier(ProtectedComponent)

  it('renders fallback when wallet not connected', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      connectedSyncedStatus({ isWalletConnected: false, isWalletSynced: false }) as any,
    )
    wrap(<Wrapped />)
    expect(screen.getByText('Connect Wallet')).toBeDefined()
    expect(screen.queryByText('Protected Component')).toBeNull()
  })

  it('renders wrapped component when wallet is connected and synced', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      connectedSyncedStatus() as any,
    )
    wrap(<Wrapped />)
    expect(screen.getByText('Protected Component')).toBeDefined()
  })
})
