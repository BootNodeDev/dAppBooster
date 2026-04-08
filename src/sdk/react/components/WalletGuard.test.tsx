import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WalletGuard, type WalletRequirement } from './WalletGuard'

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
  useMultiWallet: vi.fn(() => ({
    wallets: {},
    getWallet: vi.fn(() => undefined),
    getWalletByChainId: vi.fn(() => undefined),
    connectedAddresses: {},
  })),
}))

const { useWallet, useChainRegistry, useMultiWallet } = await import('../hooks')
const mockedUseWallet = vi.mocked(useWallet)
const mockedUseChainRegistry = vi.mocked(useChainRegistry)
const mockedUseMultiWallet = vi.mocked(useMultiWallet)

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

  it('renders nothing when wallet needsConnect and no render props provided', () => {
    const { container } = render(
      createElement(
        WalletGuard,
        null,
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(container.innerHTML).toBe('')
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })

  it('renders renderConnect when wallet needsConnect', () => {
    render(
      createElement(
        WalletGuard,
        {
          renderConnect: () =>
            createElement('button', { type: 'button', 'data-testid': 'custom-connect' }, 'Connect'),
        },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('custom-connect')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })

  it('renders deprecated fallback when provided and needsConnect (no renderConnect)', () => {
    render(
      createElement(
        WalletGuard,
        { fallback: createElement('div', { 'data-testid': 'custom-fallback' }, 'Custom') },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })

  it('prefers renderConnect over fallback when both provided', () => {
    render(
      createElement(
        WalletGuard,
        {
          renderConnect: () =>
            createElement('button', { type: 'button', 'data-testid': 'render-connect' }, 'RC'),
          fallback: createElement('div', { 'data-testid': 'custom-fallback' }, 'Fallback'),
        },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('render-connect')).toBeInTheDocument()
    expect(screen.queryByTestId('custom-fallback')).toBeNull()
  })

  it('renders renderSwitchChain when needsChainSwitch with correct props', async () => {
    const user = userEvent.setup()
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

    render(
      createElement(
        WalletGuard,
        {
          chainId: 10,
          renderSwitchChain: ({ chainName, onSwitch }) =>
            createElement(
              'button',
              { type: 'button', 'data-testid': 'switch-chain-btn', onClick: onSwitch },
              `Switch to ${chainName}`,
            ),
        },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    const switchBtn = screen.getByTestId('switch-chain-btn')
    expect(switchBtn).toBeInTheDocument()
    expect(switchBtn).toHaveTextContent('Switch to OP Mainnet')
    expect(screen.queryByTestId('protected-content')).toBeNull()

    await user.click(switchBtn)
    expect(mockSwitchChain).toHaveBeenCalledWith(10)
  })

  it('renders nothing when needsChainSwitch and no renderSwitchChain provided', () => {
    mockedUseWallet.mockReturnValue({
      ...makeWalletReady(),
      needsConnect: false,
      needsChainSwitch: true,
      isReady: false,
    })

    const { container } = render(
      createElement(
        WalletGuard,
        { chainId: 10 },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(container.innerHTML).toBe('')
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })

  it('renders children when wallet is ready', () => {
    mockedUseWallet.mockReturnValue(makeWalletReady())

    render(
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

    render(
      createElement(
        WalletGuard,
        { chainId: 10 },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
})

describe('WalletGuard multi-chain (require prop)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when all requirements are met', () => {
    const evmWallet = makeWalletReady()
    const svmWallet = {
      ...makeWalletReady(),
      adapterKey: 'svm',
      adapter: { chainType: 'svm', supportedChains: [] } as never,
    }

    mockedUseMultiWallet.mockReturnValue({
      wallets: { evm: evmWallet, svm: svmWallet },
      getWallet: vi.fn((chainType: string) => {
        if (chainType === 'evm') {
          return evmWallet
        }
        if (chainType === 'svm') {
          return svmWallet
        }
        return undefined
      }),
      getWalletByChainId: vi.fn(() => undefined),
      connectedAddresses: { evm: '0xabc', svm: 'abc123' },
    })

    const requirements: WalletRequirement[] = [{ chainType: 'evm' }, { chainType: 'svm' }]

    render(
      createElement(
        WalletGuard,
        { require: requirements },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('renders renderConnect when first requirement is not met', () => {
    mockedUseMultiWallet.mockReturnValue({
      wallets: {},
      getWallet: vi.fn(() => undefined),
      getWalletByChainId: vi.fn(() => undefined),
      connectedAddresses: {},
    })

    const requirements: WalletRequirement[] = [{ chainType: 'evm' }]

    render(
      createElement(
        WalletGuard,
        {
          require: requirements,
          renderConnect: () =>
            createElement(
              'button',
              { type: 'button', 'data-testid': 'multi-connect' },
              'Connect EVM',
            ),
        },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('multi-connect')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })

  it('renders nothing when requirement not met and no renderConnect', () => {
    mockedUseMultiWallet.mockReturnValue({
      wallets: {},
      getWallet: vi.fn(() => undefined),
      getWalletByChainId: vi.fn(() => undefined),
      connectedAddresses: {},
    })

    const requirements: WalletRequirement[] = [{ chainType: 'evm' }]

    const { container } = render(
      createElement(
        WalletGuard,
        { require: requirements },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(container.innerHTML).toBe('')
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })

  it('renders renderSwitchChain for multi-chain when needsChainSwitch', async () => {
    const user = userEvent.setup()
    const evmWallet = {
      ...makeWalletReady(),
      needsChainSwitch: true,
      isReady: false,
    }

    mockedUseMultiWallet.mockReturnValue({
      wallets: { evm: evmWallet },
      getWallet: vi.fn(() => undefined),
      getWalletByChainId: vi.fn((chainId: string | number) => {
        if (String(chainId) === '10') {
          return evmWallet
        }
        return undefined
      }),
      connectedAddresses: { evm: '0xabc' },
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

    const requirements: WalletRequirement[] = [{ chainId: 10 }]

    render(
      createElement(
        WalletGuard,
        {
          require: requirements,
          renderSwitchChain: ({ chainName, onSwitch }) =>
            createElement(
              'button',
              { type: 'button', 'data-testid': 'multi-switch', onClick: onSwitch },
              `Switch to ${chainName}`,
            ),
        },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    const switchBtn = screen.getByTestId('multi-switch')
    expect(switchBtn).toHaveTextContent('Switch to OP Mainnet')

    await user.click(switchBtn)
    expect(mockSwitchChain).toHaveBeenCalledWith(10)
  })

  it('renders renderConnect for second unmet requirement when first is met', () => {
    const evmWallet = makeWalletReady()

    mockedUseMultiWallet.mockReturnValue({
      wallets: { evm: evmWallet },
      getWallet: vi.fn((chainType: string) => {
        if (chainType === 'evm') {
          return evmWallet
        }
        return undefined
      }),
      getWalletByChainId: vi.fn(() => undefined),
      connectedAddresses: { evm: '0xabc' },
    })

    const requirements: WalletRequirement[] = [{ chainType: 'evm' }, { chainType: 'svm' }]

    render(
      createElement(
        WalletGuard,
        {
          require: requirements,
          renderConnect: () =>
            createElement(
              'button',
              { type: 'button', 'data-testid': 'multi-connect' },
              'Connect SVM',
            ),
        },
        createElement('div', { 'data-testid': 'protected-content' }, 'Protected'),
      ),
    )

    expect(screen.getByTestId('multi-connect')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).toBeNull()
  })
})
