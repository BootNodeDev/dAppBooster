import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

const system = createSystem(defaultConfig)

vi.mock('@/src/core/utils/hash', async () => {
  const actual =
    await vi.importActual<typeof import('@/src/core/utils/hash')>('@/src/core/utils/hash')
  return {
    ...actual, // keep isValidTransactionHash, etc.
    default: vi.fn(),
  }
})

const walletStatusMock = {
  status: { connected: false, connectedChainIds: [] as number[] },
}

vi.mock('@/src/sdk/react/hooks', () => ({
  useWallet: () => walletStatusMock,
  useChainRegistry: () => ({ getChain: () => null }),
}))

vi.mock('viem', async () => {
  const actual = await vi.importActual<typeof import('viem')>('viem')
  return {
    ...actual,
    createPublicClient: vi.fn(
      ({ chain }: { chain: { id: number } }) =>
        ({ __chainId: chain.id }) as unknown as ReturnType<typeof actual.createPublicClient>,
    ),
  }
})

vi.mock('@/src/core/types', () => ({
  chains: [
    { id: 1, name: 'Ethereum' },
    { id: 11155111, name: 'Sepolia' },
    { id: 84532, name: 'Base Sepolia' },
  ],
  transports: {
    1: 'transport-mainnet',
    11155111: 'transport-sepolia',
    84532: 'transport-base-sepolia',
  },
}))

const TX_HASH = '0xd85ef8c70dc31a4f8d5bf0331e1eac886935905f15d32e71b348df745cd38e19'

const renderDemo = async () => {
  // Re-import after mocks so module-level state picks up fresh wallet mock values
  const { default: hashHandling } = await import('./index')
  return render(<ChakraProvider value={system}>{hashHandling.demo}</ChakraProvider>)
}

const getDetectHash = async () => (await import('@/src/core/utils/hash')).default as Mock

describe('HashHandling demo — UI integration', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    walletStatusMock.status = { connected: false, connectedChainIds: [] }
  })

  it('queries primary chain (mainnet) first when wallet is disconnected', async () => {
    const detectHash = await getDetectHash()
    detectHash
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'not-found' })

    await renderDemo()
    const input = await screen.findByPlaceholderText(/address.*hash/i)
    fireEvent.change(input, { target: { value: TX_HASH } })

    await waitFor(() => {
      expect(detectHash).toHaveBeenCalledTimes(3)
    })

    // First call must be the mainnet client (id 1) since wallet is disconnected
    expect(detectHash.mock.calls[0][0].publicClient.__chainId).toBe(1)
  })

  it('renders the exact chain badge for the found chain', async () => {
    const detectHash = await getDetectHash()
    detectHash
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'found', type: 'transaction', data: { hash: TX_HASH } })
      .mockResolvedValueOnce({ status: 'not-found' })

    await renderDemo()
    const input = await screen.findByPlaceholderText(/address.*hash/i)
    fireEvent.change(input, { target: { value: TX_HASH } })

    await waitFor(() => {
      expect(screen.getByText('Found on Sepolia')).toBeInTheDocument()
    })
  })

  it("shows couldn't-reach suffix on partial RPC errors", async () => {
    const detectHash = await getDetectHash()
    detectHash
      .mockResolvedValueOnce({ status: 'rpc-error', error: new Error('timeout') })
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'rpc-error', error: new Error('quota') })

    await renderDemo()
    const input = await screen.findByPlaceholderText(/address.*hash/i)
    fireEvent.change(input, { target: { value: TX_HASH } })

    await waitFor(() => {
      expect(screen.getByText(/couldn't reach/i)).toBeInTheDocument()
    })
  })

  it('distinguishes all-chains-errored from not-found', async () => {
    const detectHash = await getDetectHash()
    detectHash
      .mockResolvedValueOnce({ status: 'rpc-error', error: new Error('a') })
      .mockResolvedValueOnce({ status: 'rpc-error', error: new Error('b') })
      .mockResolvedValueOnce({ status: 'rpc-error', error: new Error('c') })

    await renderDemo()
    const input = await screen.findByPlaceholderText(/address.*hash/i)
    fireEvent.change(input, { target: { value: TX_HASH } })

    await waitFor(() => {
      expect(screen.getByText(/couldn't check any chain/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/not found on any of/i)).not.toBeInTheDocument()
  })

  it('uses wallet chain as primary when wallet is connected', async () => {
    walletStatusMock.status = { connected: true, connectedChainIds: [11155111] }

    const detectHash = await getDetectHash()
    detectHash
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'not-found' })

    await renderDemo()
    const input = await screen.findByPlaceholderText(/address.*hash/i)
    fireEvent.change(input, { target: { value: TX_HASH } })

    await waitFor(() => {
      expect(detectHash).toHaveBeenCalledTimes(3)
    })

    // First call must be the wallet-connected chain (Sepolia, id 11155111)
    expect(detectHash.mock.calls[0][0].publicClient.__chainId).toBe(11155111)
  })

  it('clears the result when input is emptied', async () => {
    const detectHash = await getDetectHash()
    detectHash
      .mockResolvedValueOnce({ status: 'not-found' })
      .mockResolvedValueOnce({ status: 'found', type: 'transaction', data: { hash: TX_HASH } })
      .mockResolvedValueOnce({ status: 'not-found' })

    await renderDemo()
    const input = await screen.findByPlaceholderText(/address.*hash/i)
    fireEvent.change(input, { target: { value: TX_HASH } })

    await waitFor(() => {
      expect(screen.getByText('Found on Sepolia')).toBeInTheDocument()
    })

    fireEvent.change(input, { target: { value: '' } })

    await waitFor(() => {
      expect(screen.queryByText('Found on Sepolia')).not.toBeInTheDocument()
    })
  })
})
