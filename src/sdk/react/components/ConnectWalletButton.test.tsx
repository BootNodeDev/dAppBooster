import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConnectWalletButton } from './ConnectWalletButton'

const mockOpenConnectModal = vi.fn()
const mockOpenAccountModal = vi.fn()

vi.mock('../hooks/useWallet', () => ({
  useWallet: vi.fn(() => ({
    adapter: {} as never,
    needsConnect: true,
    needsChainSwitch: false,
    isReady: false,
    status: { connected: false, connecting: false, activeAccount: null, connectedChainIds: [] },
    switchChain: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    signMessage: vi.fn(),
    getSigner: vi.fn(),
    adapterKey: 'evm',
    openConnectModal: mockOpenConnectModal,
    openAccountModal: mockOpenAccountModal,
  })),
}))

const { useWallet } = await import('../hooks/useWallet')
const mockedUseWallet = vi.mocked(useWallet)

describe('ConnectWalletButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls render with disconnected status and connect callback', () => {
    render(
      createElement(ConnectWalletButton, {
        render: ({ status, onConnect }) =>
          createElement(
            'button',
            { type: 'button', 'data-testid': 'connect-btn', onClick: onConnect },
            status.connected ? 'Connected' : 'Connect',
          ),
      }),
    )

    expect(screen.getByTestId('connect-btn')).toHaveTextContent('Connect')
  })

  it('calls onConnect (openConnectModal) when disconnected', async () => {
    const user = userEvent.setup()

    render(
      createElement(ConnectWalletButton, {
        render: ({ onConnect }) =>
          createElement(
            'button',
            { type: 'button', 'data-testid': 'connect-btn', onClick: onConnect },
            'Connect',
          ),
      }),
    )

    await user.click(screen.getByTestId('connect-btn'))
    expect(mockOpenConnectModal).toHaveBeenCalledOnce()
  })

  it('provides truncated address when connected', () => {
    mockedUseWallet.mockReturnValue({
      adapter: {} as never,
      needsConnect: false,
      needsChainSwitch: false,
      isReady: true,
      status: {
        connected: true,
        connecting: false,
        activeAccount: '0x1234567890abcdef1234567890abcdef12345678',
        connectedChainIds: [1],
      },
      switchChain: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      getSigner: vi.fn(),
      adapterKey: 'evm',
      openConnectModal: mockOpenConnectModal,
      openAccountModal: mockOpenAccountModal,
    })

    render(
      createElement(ConnectWalletButton, {
        render: ({ status, truncatedAddress }) =>
          createElement(
            'span',
            { 'data-testid': 'address' },
            status.connected ? truncatedAddress : 'Not connected',
          ),
      }),
    )

    expect(screen.getByTestId('address')).toHaveTextContent('0x1234\u20265678')
  })

  it('calls onManageAccount (openAccountModal) when connected', async () => {
    const user = userEvent.setup()

    mockedUseWallet.mockReturnValue({
      adapter: {} as never,
      needsConnect: false,
      needsChainSwitch: false,
      isReady: true,
      status: {
        connected: true,
        connecting: false,
        activeAccount: '0xabc',
        connectedChainIds: [1],
      },
      switchChain: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      getSigner: vi.fn(),
      adapterKey: 'evm',
      openConnectModal: mockOpenConnectModal,
      openAccountModal: mockOpenAccountModal,
    })

    render(
      createElement(ConnectWalletButton, {
        render: ({ onManageAccount }) =>
          createElement(
            'button',
            { type: 'button', 'data-testid': 'account-btn', onClick: onManageAccount },
            'Account',
          ),
      }),
    )

    await user.click(screen.getByTestId('account-btn'))
    expect(mockOpenAccountModal).toHaveBeenCalledOnce()
  })

  it('passes wallet options (chainId) to useWallet', () => {
    render(
      createElement(ConnectWalletButton, {
        chainId: 10,
        render: ({ status }) =>
          createElement('span', { 'data-testid': 'status' }, String(status.connected)),
      }),
    )

    expect(mockedUseWallet).toHaveBeenCalledWith(expect.objectContaining({ chainId: 10 }))
  })
})
