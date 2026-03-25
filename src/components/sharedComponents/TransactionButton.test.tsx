import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import TransactionButton from './TransactionButton'

const system = createSystem(defaultConfig)

vi.mock('@/src/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(),
}))

vi.mock('@/src/providers/TransactionNotificationProvider', () => ({
  useTransactionNotification: vi.fn(() => ({
    watchTx: vi.fn(),
    watchHash: vi.fn(),
    watchSignature: vi.fn(),
  })),
}))

vi.mock('wagmi', () => ({
  useWaitForTransactionReceipt: vi.fn(() => ({ data: undefined })),
}))

vi.mock('@/src/providers/Web3Provider', () => ({
  ConnectWalletButton: () => <button type="button">Connect Wallet</button>,
}))

import * as useWeb3StatusModule from '@/src/hooks/useWeb3Status'
import * as wagmiModule from 'wagmi'

// chains[0] = optimismSepolia (id: 11155420) when PUBLIC_INCLUDE_TESTNETS=true (default)
const OP_SEPOLIA_ID = 11155420 as const

function connectedStatus() {
  return {
    isWalletConnected: true,
    isWalletSynced: true,
    walletChainId: OP_SEPOLIA_ID,
    appChainId: OP_SEPOLIA_ID,
    address: '0x1234567890abcdef1234567890abcdef12345678' as `0x${string}`,
    balance: undefined,
    connectingWallet: false,
    switchingChain: false,
    walletClient: undefined,
    readOnlyClient: undefined,
    switchChain: vi.fn(),
    disconnect: vi.fn(),
  }
}

// biome-ignore lint/suspicious/noExplicitAny: test helper accepts flexible props
function renderButton(props: any = {}) {
  return render(
    <ChakraProvider value={system}>
      <TransactionButton
        transaction={() => Promise.resolve('0x1' as `0x${string}`)}
        {...props}
      />
    </ChakraProvider>,
  )
}

describe('TransactionButton', () => {
  it('renders fallback when wallet not connected', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue({
      ...connectedStatus(),
      isWalletConnected: false,
      isWalletSynced: false,
    })
    renderButton()
    expect(screen.getByText('Connect Wallet')).toBeDefined()
  })

  it('renders switch chain button when wallet is on wrong chain', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue({
      ...connectedStatus(),
      isWalletSynced: false,
      walletChainId: 1,
    })
    renderButton()
    expect(screen.getByRole('button').textContent?.toLowerCase()).toContain('switch to')
  })

  it('renders with default label when wallet is connected and synced', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(connectedStatus())
    vi.mocked(wagmiModule.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof wagmiModule.useWaitForTransactionReceipt>)
    renderButton()
    expect(screen.getByText('Send Transaction')).toBeDefined()
  })

  it('renders with custom children label', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(connectedStatus())
    vi.mocked(wagmiModule.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof wagmiModule.useWaitForTransactionReceipt>)
    renderButton({ children: 'Deposit ETH' })
    expect(screen.getByText('Deposit ETH')).toBeDefined()
  })

  it('shows labelSending while transaction is pending', async () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(connectedStatus())
    vi.mocked(wagmiModule.useWaitForTransactionReceipt).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof wagmiModule.useWaitForTransactionReceipt>)

    const neverResolves = () => new Promise<`0x${string}`>(() => {})
    renderButton({ transaction: neverResolves, labelSending: 'Processing...' })

    expect(screen.getByRole('button').textContent).not.toContain('Processing...')

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('button').textContent).toContain('Processing...')
    })
  })

  it('calls onMined when receipt becomes available', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: mock receipt shape
    const mockReceipt = { status: 'success', transactionHash: '0x1' } as any
    const onMined = vi.fn()

    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(connectedStatus())
    // Only return a receipt when called with the matching hash so the mock
    // doesn't fire prematurely before the transaction is submitted.
    vi.mocked(wagmiModule.useWaitForTransactionReceipt).mockImplementation(
      (config) =>
        ({
          data: config?.hash === '0x1' ? mockReceipt : undefined,
        }) as ReturnType<typeof wagmiModule.useWaitForTransactionReceipt>,
    )

    renderButton({
      transaction: () => Promise.resolve('0x1' as `0x${string}`),
      onMined,
    })

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(onMined).toHaveBeenCalledWith(mockReceipt)
    })
  })
})
