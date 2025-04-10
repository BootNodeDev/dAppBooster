import { type AbiEvent, type TransactionReceipt, decodeEventLog } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  MissingOutputError,
  TransactionOutputError,
  getTransactionOutputs,
} from '@/src/utils/getTransactionOutputs'

// Mock the viem decodeEventLog function
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem')
  return {
    ...actual,
    decodeEventLog: vi.fn((args) => {
      // Mock implementation that simulates event decoding
      if (args.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
        return {
          eventName: 'Transfer',
          args: {
            from: '0x0000000000000000000000000000000000000000',
            to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            tokenId: '0x0000000000000000000000000000000000000000000000000000000000000001',
          },
        }
      }
      throw new Error('Unknown event')
    }),
  }
})

describe('getTransactionOutputs', () => {
  // Mock ABI event for testing
  const mockAbiEvent = {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
  } as const satisfies AbiEvent

  // Mock successful transaction receipt
  const mockSuccessReceipt: TransactionReceipt = {
    logs: [
      {
        address: '0x123',
        topics: [
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event signature
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        ],
        data: '0x',
        blockHash: '0x123',
        blockNumber: 1n,
        logIndex: 0,
        removed: false,
        transactionHash: '0x123',
        transactionIndex: 0,
      },
    ],
    blockHash: '0x123',
    blockNumber: 1n,
    transactionHash: '0x123',
    from: '0x123',
    to: '0x123',
    status: 'success',
    contractAddress: null,
    gasUsed: 21000n,
    effectiveGasPrice: 1n,
    cumulativeGasUsed: 21000n,
    type: 'eip1559',
    logsBloom: '0x0',
    transactionIndex: 0,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  it('successfully extracts hex values from transaction logs', () => {
    const outputs = getTransactionOutputs(mockSuccessReceipt, mockAbiEvent, [
      'to',
      'tokenId',
    ] as const)

    expect(outputs).toEqual({
      to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      tokenId: '0x0000000000000000000000000000000000000000000000000000000000000001',
    })
    expect(decodeEventLog).toHaveBeenCalled()
  })

  it('throws MissingOutputError when required outputs are not found', () => {
    expect(() =>
      getTransactionOutputs(mockSuccessReceipt, mockAbiEvent, ['nonexistent'] as const),
    ).toThrow(MissingOutputError)
  })

  it('returns partial results when throwOnMissing is false', () => {
    const outputs = getTransactionOutputs(
      mockSuccessReceipt,
      mockAbiEvent,
      ['to', 'nonexistent'] as const,
      { throwOnMissing: false },
    )

    expect(outputs).toEqual({
      to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    })
  })

  it('logs decode errors when logDecodeErrors is true', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn')
    const invalidReceipt: TransactionReceipt = {
      ...mockSuccessReceipt,
      logs: [
        {
          ...mockSuccessReceipt.logs[0],
          topics: ['0xinvalid'],
        },
      ],
    }

    getTransactionOutputs(invalidReceipt, mockAbiEvent, ['to'] as const, {
      throwOnMissing: false,
      logDecodeErrors: true,
    })

    expect(consoleWarnSpy).toHaveBeenCalled()
  })

  it('handles empty logs array', () => {
    const emptyReceipt: TransactionReceipt = {
      ...mockSuccessReceipt,
      logs: [],
    }

    expect(() => getTransactionOutputs(emptyReceipt, mockAbiEvent, ['to'] as const)).toThrow(
      MissingOutputError,
    )
  })

  it('processes multiple logs to find all required outputs', () => {
    const multiLogReceipt: TransactionReceipt = {
      ...mockSuccessReceipt,
      logs: [
        mockSuccessReceipt.logs[0],
        {
          ...mockSuccessReceipt.logs[0],
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000b0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
          ],
        },
      ],
    }

    const outputs = getTransactionOutputs(multiLogReceipt, mockAbiEvent, ['to'] as const)
    expect(outputs).toEqual({
      to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    })
  })

  it('throws TransactionOutputError for invalid receipt', () => {
    expect(() =>
      getTransactionOutputs(null as unknown as TransactionReceipt, mockAbiEvent, ['to'] as const),
    ).toThrow(TransactionOutputError)
  })
})
