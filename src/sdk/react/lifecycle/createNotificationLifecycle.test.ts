import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChainRegistry } from '../../core/chain/registry'
import {
  createNotificationLifecycle,
  createSigningNotificationLifecycle,
} from './createNotificationLifecycle'

const mockCreate = vi.fn()
const mockToaster = { create: mockCreate }

const makeResult = (status: 'success' | 'reverted' | 'timeout') => ({
  status,
  ref: { chainType: 'evm', id: '0xhash', chainId: 1 },
  receipt: {},
})

function makeRegistry(_explorerUrl: string | null): ChainRegistry {
  return {
    getChain: vi.fn((chainId) => {
      if (!_explorerUrl) {
        return null
      }
      return {
        caip2Id: `eip155:${chainId}`,
        chainId,
        name: 'Ethereum',
        chainType: 'evm',
        nativeCurrency: { symbol: 'ETH', decimals: 18 },
        explorer: {
          url: 'https://etherscan.io',
          txPath: '/tx/{id}',
          addressPath: '/address/{id}',
        },
        addressConfig: { format: 'hex' as const, patterns: [] },
      }
    }),
    getChainByCaip2: vi.fn(() => null),
    getChainType: vi.fn(() => null),
    getChainsByType: vi.fn(() => []),
    getAllChains: vi.fn(() => []),
  }
}

describe('createNotificationLifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockReturnValue('toast-1')
  })

  it('onSubmit creates a loading toast', () => {
    const lifecycle = createNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })

    expect(mockCreate).toHaveBeenCalledOnce()
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'loading', description: 'Transaction submitted' }),
    )
  })

  it('onConfirm creates a success toast when status is success, passing the toastId as id', () => {
    const lifecycle = createNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })
    lifecycle.onConfirm?.(makeResult('success'))

    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: 'success',
        description: 'Transaction confirmed!',
        id: 'toast-1',
      }),
    )
  })

  it('onConfirm creates an error toast when status is reverted, passing the toastId as id', () => {
    const lifecycle = createNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })
    lifecycle.onConfirm?.(makeResult('reverted'))

    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: 'error',
        description: 'Transaction was reverted',
        id: 'toast-1',
      }),
    )
  })

  it('onError creates an error toast, passing the toastId as id', () => {
    const lifecycle = createNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })
    lifecycle.onError?.('submit', new Error('Something went wrong'))

    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: 'error',
        description: 'Something went wrong',
        id: 'toast-1',
      }),
    )
  })

  it('uses custom messages.submitted when provided', () => {
    const lifecycle = createNotificationLifecycle({
      toaster: mockToaster,
      messages: { submitted: 'Sending tx...' },
    })
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Sending tx...' }),
    )
  })

  it('uses custom messages.confirmed when provided', () => {
    const lifecycle = createNotificationLifecycle({
      toaster: mockToaster,
      messages: { confirmed: 'Done!' },
    })
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })
    lifecycle.onConfirm?.(makeResult('success'))

    expect(mockCreate).toHaveBeenNthCalledWith(2, expect.objectContaining({ description: 'Done!' }))
  })

  it('uses custom messages.reverted when provided', () => {
    const lifecycle = createNotificationLifecycle({
      toaster: mockToaster,
      messages: { reverted: 'Tx failed!' },
    })
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })
    lifecycle.onConfirm?.(makeResult('reverted'))

    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ description: 'Tx failed!' }),
    )
  })

  it('uses custom messages.error when provided', () => {
    const lifecycle = createNotificationLifecycle({
      toaster: mockToaster,
      messages: { error: 'Custom error message' },
    })
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })
    lifecycle.onError?.('submit', new Error('raw error'))

    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ description: 'Custom error message' }),
    )
  })

  it('clears toastId after onConfirm so subsequent onSubmit creates a fresh toast', () => {
    const lifecycle = createNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })
    lifecycle.onConfirm?.(makeResult('success'))

    // Second submit — toastId should be undefined, so no id field in the new loading toast
    mockCreate.mockReturnValue('toast-2')
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x2', chainId: 1 })

    expect(mockCreate).toHaveBeenNthCalledWith(3, expect.objectContaining({ type: 'loading' }))
    // The third call should NOT have id set (toastId was cleared)
    const thirdCall = mockCreate.mock.calls[2][0]
    expect(thirdCall.id).toBeUndefined()
  })

  it('threads toastId from onSubmit to onConfirm', () => {
    const lifecycle = createNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })
    expect(mockCreate).toHaveBeenNthCalledWith(1, expect.objectContaining({ type: 'loading' }))
    lifecycle.onConfirm?.(makeResult('success'))
    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: 'toast-1', type: 'success' }),
    )
  })

  describe('onReplace', () => {
    it('creates a toast with replacement info', () => {
      const lifecycle = createNotificationLifecycle({ toaster: mockToaster })
      lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })

      lifecycle.onReplace?.(
        { chainType: 'evm', id: '0x1', chainId: 1 },
        { chainType: 'evm', id: '0x2', chainId: 1 },
        'repriced',
      )

      expect(mockCreate).toHaveBeenCalledTimes(2)
      expect(mockCreate).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: 'loading',
          id: 'toast-1',
        }),
      )
      const call = mockCreate.mock.calls[1][0]
      expect(call.description).toContain('repriced')
    })

    it('uses custom replaced message when provided', () => {
      const lifecycle = createNotificationLifecycle({
        toaster: mockToaster,
        messages: { replaced: 'Tx was replaced' },
      })
      lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })

      lifecycle.onReplace?.(
        { chainType: 'evm', id: '0x1', chainId: 1 },
        { chainType: 'evm', id: '0x2', chainId: 1 },
        'cancelled',
      )

      const call = mockCreate.mock.calls[1][0]
      expect(call.description).toBe('Tx was replaced')
    })
  })

  describe('explorer URL in confirm toast', () => {
    it('includes explorer URL when registry is provided', () => {
      const registry = makeRegistry('https://etherscan.io/tx/0xhash')
      const lifecycle = createNotificationLifecycle({ toaster: mockToaster, registry })

      lifecycle.onSubmit?.({ chainType: 'evm', id: '0xhash', chainId: 1 })
      lifecycle.onConfirm?.(makeResult('success'))

      const call = mockCreate.mock.calls[1][0]
      expect(call.description).toContain('https://etherscan.io/tx/0xhash')
    })

    it('does not include explorer URL when registry is not provided', () => {
      const lifecycle = createNotificationLifecycle({ toaster: mockToaster })

      lifecycle.onSubmit?.({ chainType: 'evm', id: '0xhash', chainId: 1 })
      lifecycle.onConfirm?.(makeResult('success'))

      const call = mockCreate.mock.calls[1][0]
      expect(call.description).toBe('Transaction confirmed!')
    })
  })

  describe('shortMessage extraction for viem errors', () => {
    it('uses shortMessage when present on error', () => {
      const lifecycle = createNotificationLifecycle({ toaster: mockToaster })
      lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })

      const viemError = Object.assign(new Error('Full verbose error'), {
        shortMessage: 'User rejected the request',
      })
      lifecycle.onError?.('submit', viemError)

      expect(mockCreate).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          description: 'User rejected the request',
          type: 'error',
        }),
      )
    })

    it('falls back to error.message when shortMessage is absent', () => {
      const lifecycle = createNotificationLifecycle({ toaster: mockToaster })
      lifecycle.onSubmit?.({ chainType: 'evm', id: '0x1', chainId: 1 })

      lifecycle.onError?.('submit', new Error('Plain error'))

      expect(mockCreate).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          description: 'Plain error',
          type: 'error',
        }),
      )
    })
  })
})

describe('createSigningNotificationLifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockReturnValue('toast-1')
  })

  it('onSign creates a loading toast', () => {
    const lifecycle = createSigningNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSign?.('message', { message: 'Hello' })

    expect(mockCreate).toHaveBeenCalledOnce()
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'loading', description: 'Signature requested' }),
    )
  })

  it('uses custom signatureRequested message', () => {
    const lifecycle = createSigningNotificationLifecycle({
      toaster: mockToaster,
      messages: { signatureRequested: 'Please sign...' },
    })
    lifecycle.onSign?.('message', { message: 'Hello' })

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Please sign...' }),
    )
  })

  it('onSignComplete creates a success toast', () => {
    const lifecycle = createSigningNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSign?.('message', { message: 'Hello' })
    lifecycle.onSignComplete?.({ signature: '0xsig', address: '0xaddr' })

    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: 'success',
        description: 'Signature received!',
        id: 'toast-1',
      }),
    )
  })

  it('uses custom signatureReceived message', () => {
    const lifecycle = createSigningNotificationLifecycle({
      toaster: mockToaster,
      messages: { signatureReceived: 'Signed!' },
    })
    lifecycle.onSign?.('message', { message: 'Hello' })
    lifecycle.onSignComplete?.({ signature: '0xsig', address: '0xaddr' })

    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ description: 'Signed!' }),
    )
  })

  it('onSignError creates an error toast', () => {
    const lifecycle = createSigningNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSign?.('message', { message: 'Hello' })
    lifecycle.onSignError?.(new Error('Rejected'))

    expect(mockCreate).toHaveBeenCalledTimes(2)
    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: 'error',
        description: 'Rejected',
        id: 'toast-1',
      }),
    )
  })

  it('uses shortMessage from viem errors', () => {
    const lifecycle = createSigningNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSign?.('message', { message: 'Hello' })

    const viemError = Object.assign(new Error('Long error'), {
      shortMessage: 'User rejected',
    })
    lifecycle.onSignError?.(viemError)

    expect(mockCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ description: 'User rejected' }),
    )
  })

  it('clears toastId after onSignComplete', () => {
    const lifecycle = createSigningNotificationLifecycle({ toaster: mockToaster })
    lifecycle.onSign?.('message', { message: 'Hello' })
    lifecycle.onSignComplete?.({ signature: '0xsig', address: '0xaddr' })

    mockCreate.mockReturnValue('toast-2')
    lifecycle.onSign?.('message', { message: 'Hello again' })

    const thirdCall = mockCreate.mock.calls[2][0]
    expect(thirdCall.id).toBeUndefined()
  })
})
