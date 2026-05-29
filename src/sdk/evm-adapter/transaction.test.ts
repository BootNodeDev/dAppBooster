import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TransactionRef } from '../core/adapters/transaction'
import { ChainNotSupportedError, InsufficientFundsError, InvalidSignerError } from '../core/errors'
import { createEvmTransactionAdapter } from './transaction'
import type { EvmContractCall, EvmRawTransaction } from './types'

vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal<typeof import('viem')>()
  return {
    ...actual,
    createPublicClient: vi.fn(),
  }
})

const makePublicClient = (overrides: Record<string, unknown> = {}) => ({
  estimateGas: vi.fn().mockResolvedValue(21000n),
  estimateContractGas: vi.fn().mockResolvedValue(21000n),
  getGasPrice: vi.fn().mockResolvedValue(1_000_000_000n),
  waitForTransactionReceipt: vi
    .fn()
    .mockResolvedValue({ status: 'success', transactionHash: '0xhash' }),
  ...overrides,
})

describe('createEvmTransactionAdapter', () => {
  let mockPublicClient: ReturnType<typeof makePublicClient>

  beforeEach(() => {
    mockPublicClient = makePublicClient()
    vi.mocked(createPublicClient).mockReturnValue(mockPublicClient as never)
  })

  it('throws when config.chains is empty', () => {
    expect(() => createEvmTransactionAdapter({ chains: [], transports: {} })).toThrow(
      'createEvmTransactionAdapter requires at least one chain',
    )
  })

  it('throws when a chain has no corresponding transport', () => {
    expect(() =>
      createEvmTransactionAdapter({
        chains: [mainnet],
        transports: {},
      }),
    ).toThrow('chain "Ethereum" (id: 1) has no transport configured')
  })

  // ---------------------------------------------------------------------------
  // structural / metadata
  // ---------------------------------------------------------------------------

  it('exposes chainType = "evm"', () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })
    expect(adapter.chainType).toBe('evm')
  })

  it('exposes metadata.chainType = "evm"', () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })
    expect(adapter.metadata.chainType).toBe('evm')
  })

  it('exposes metadata.feeModel = "eip1559"', () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })
    expect(adapter.metadata.feeModel).toBe('eip1559')
  })

  it('supportedChains contains the mainnet descriptor', () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })
    expect(adapter.supportedChains).toHaveLength(1)
    expect(adapter.supportedChains[0].chainId).toBe(mainnet.id)
    expect(adapter.supportedChains[0].chainType).toBe('evm')
  })

  // ---------------------------------------------------------------------------
  // prepare()
  // ---------------------------------------------------------------------------

  it('returns ready: true with estimatedFee for a raw transaction', async () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    const result = await adapter.prepare({
      chainId: mainnet.id,
      payload: { to: '0xabc' as `0x${string}`, value: 0n } as EvmRawTransaction,
    })

    expect(result.ready).toBe(true)
    expect(result.estimatedFee?.amount).toBe((21000n * 1_000_000_000n).toString())
    expect(result.estimatedFee?.symbol).toBe('ETH')
    expect(result.estimatedFee?.decimals).toBe(18)
  })

  it('returns ready: false when chain is not configured', async () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    const result = await adapter.prepare({ chainId: 999, payload: { to: '0xabc' } as never })

    expect(result.ready).toBe(false)
    expect(result.reason).toBeTruthy()
  })

  it('throws InsufficientFundsError when estimateGas reports insufficient funds', async () => {
    mockPublicClient.estimateGas.mockRejectedValue(new Error('insufficient funds for gas'))
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    await expect(
      adapter.prepare({ chainId: mainnet.id, payload: { to: '0xabc' } as never }),
    ).rejects.toThrow(InsufficientFundsError)
  })

  it('returns ready: false with reason on generic errors', async () => {
    mockPublicClient.estimateGas.mockRejectedValue(new Error('call reverted'))
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    const result = await adapter.prepare({ chainId: mainnet.id, payload: { to: '0xabc' } as never })

    expect(result.ready).toBe(false)
    expect(result.reason).toContain('call reverted')
  })

  it('returns ready: false when a preStep targets an unsupported chain', async () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })
    const result = await adapter.prepare({
      chainId: mainnet.id,
      payload: { to: '0xabc' as `0x${string}` } as EvmRawTransaction,
      preSteps: [{ label: 'Approve', params: { chainId: 999, payload: {} } }],
    })
    expect(result.ready).toBe(false)
    expect(result.reason).toContain('Pre-step')
  })

  it('uses estimateContractGas for EvmContractCall payload', async () => {
    mockPublicClient.estimateContractGas = vi.fn().mockResolvedValue(50000n)
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    const result = await adapter.prepare({
      chainId: mainnet.id,
      payload: {
        contract: {
          address: '0xabc' as `0x${string}`,
          abi: [],
          functionName: 'transfer',
          args: [],
        },
      } as EvmContractCall,
    })

    expect(mockPublicClient.estimateContractGas).toHaveBeenCalled()
    expect(result.ready).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // execute()
  // ---------------------------------------------------------------------------

  it('throws InvalidSignerError when signer is a plain object (not WalletClient)', async () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    await expect(
      adapter.execute({ chainId: mainnet.id, payload: { to: '0xabc' } as never }, {}),
    ).rejects.toThrow(InvalidSignerError)
  })

  it('throws InvalidSignerError when signer is null', async () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    await expect(
      adapter.execute({ chainId: mainnet.id, payload: { to: '0xabc' } as never }, null as never),
    ).rejects.toThrow(InvalidSignerError)
  })

  it('throws ChainNotSupportedError when execute targets an unsupported chain', async () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    const mockWalletClient = {
      sendTransaction: vi.fn().mockResolvedValue('0xhash'),
      writeContract: vi.fn(),
    }

    await expect(
      adapter.execute(
        { chainId: 999999, payload: { to: '0xabc' as `0x${string}` } as EvmRawTransaction },
        mockWalletClient as never,
      ),
    ).rejects.toThrow(ChainNotSupportedError)
  })

  it('returns TransactionRef with hash for EvmRawTransaction', async () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    const mockWalletClient = {
      sendTransaction: vi.fn().mockResolvedValue('0xhash'),
      writeContract: vi.fn(),
    }

    const result = await adapter.execute(
      { chainId: mainnet.id, payload: { to: '0xabc' as `0x${string}` } as EvmRawTransaction },
      mockWalletClient as never,
    )

    expect(result).toEqual({ chainType: 'evm', id: '0xhash', chainId: mainnet.id })
    expect(mockWalletClient.sendTransaction).toHaveBeenCalled()
  })

  it('uses writeContract for EvmContractCall payload', async () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })

    const mockWalletClient = {
      writeContract: vi.fn().mockResolvedValue('0xhash'),
      sendTransaction: vi.fn(),
    }

    await adapter.execute(
      {
        chainId: mainnet.id,
        payload: {
          contract: {
            address: '0xabc' as `0x${string}`,
            abi: [],
            functionName: 'approve',
            args: [],
          },
        } as EvmContractCall,
      },
      mockWalletClient as never,
    )

    expect(mockWalletClient.writeContract).toHaveBeenCalled()
    expect(mockWalletClient.sendTransaction).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // confirm()
  // ---------------------------------------------------------------------------

  it('returns status: "success" for a successful receipt', async () => {
    mockPublicClient.waitForTransactionReceipt = vi.fn().mockResolvedValue({
      status: 'success',
      transactionHash: '0xhash',
    })
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })
    const ref: TransactionRef = { chainType: 'evm', id: '0xhash', chainId: mainnet.id }

    const result = await adapter.confirm(ref)

    expect(result.status).toBe('success')
    expect(result.ref).toEqual(ref)
  })

  it('returns status: "reverted" for a reverted receipt', async () => {
    mockPublicClient.waitForTransactionReceipt = vi.fn().mockResolvedValue({
      status: 'reverted',
      transactionHash: '0xhash',
    })
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })
    const ref: TransactionRef = { chainType: 'evm', id: '0xhash', chainId: mainnet.id }

    const result = await adapter.confirm(ref)

    expect(result.status).toBe('reverted')
  })

  it('returns status: "timeout" when tx is not confirmed within timeout', async () => {
    mockPublicClient.waitForTransactionReceipt = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}))
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })
    const ref: TransactionRef = { chainType: 'evm', id: '0xhash', chainId: mainnet.id }

    const result = await adapter.confirm(ref, { timeout: 1 })

    expect(result.status).toBe('timeout')
  })

  it('resolves to a terminal "timeout" result (not an unhandled rejection) when the RPC rejects', async () => {
    const rpcError = new Error('HTTP request failed: 503 Service Unavailable')
    mockPublicClient.waitForTransactionReceipt = vi.fn().mockRejectedValue(rpcError)
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })
    const ref: TransactionRef = { chainType: 'evm', id: '0xhash', chainId: mainnet.id }

    const result = await adapter.confirm(ref)

    expect(result.status).toBe('timeout')
    expect(result.ref).toEqual(ref)
    expect(result.receipt).toBeNull()
    expect(result.error).toBe(rpcError)
  })

  it('clears the timeout timer once the receipt wins the race (no dangling timer)', async () => {
    vi.useFakeTimers()
    try {
      mockPublicClient.waitForTransactionReceipt = vi
        .fn()
        .mockResolvedValue({ status: 'success', transactionHash: '0xhash' })
      const adapter = createEvmTransactionAdapter({
        chains: [mainnet],
        transports: { [mainnet.id]: http() },
      })
      const ref: TransactionRef = { chainType: 'evm', id: '0xhash', chainId: mainnet.id }

      await adapter.confirm(ref)

      // The 60s timeout timer must have actually been cleared — not merely "clearTimeout
      // was called". A dangling fake timer would leave the count at 1.
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('rejects when ref.chainId is not configured in the adapter (precondition violation)', async () => {
    const adapter = createEvmTransactionAdapter({
      chains: [mainnet],
      transports: { [mainnet.id]: http() },
    })
    const ref: TransactionRef = { chainType: 'evm', id: '0xhash', chainId: 999_999 }

    await expect(adapter.confirm(ref)).rejects.toThrow()
  })
})
