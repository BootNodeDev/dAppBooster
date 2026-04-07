import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createNotificationLifecycle } from './createNotificationLifecycle'

const mockCreate = vi.fn()
const mockToaster = { create: mockCreate }

const makeResult = (status: 'success' | 'reverted' | 'timeout') => ({
  status,
  ref: { chainType: 'evm', id: '0xhash', chainId: 1 },
  receipt: {},
})

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
})
