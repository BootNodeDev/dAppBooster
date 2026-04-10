import { describe, expect, it, vi } from 'vitest'
import type {
  SignatureResult,
  SignMessageInput,
  SignTypedDataInput,
  WalletAdapter,
} from '../../core/adapters/wallet'
import type { WalletLifecycle } from '../../core/lifecycle'
import { fireWalletLifecycle, wrapSignMessage, wrapSignTypedData } from './walletLifecycle'

// ---------------------------------------------------------------------------
// fireWalletLifecycle
// ---------------------------------------------------------------------------

describe('fireWalletLifecycle', () => {
  it('calls the lifecycle hook with the provided arguments', () => {
    const onSign = vi.fn()
    const lifecycle: WalletLifecycle = { onSign }
    const input: SignMessageInput = { message: 'hello' }

    fireWalletLifecycle('onSign', lifecycle, 'message', input)

    expect(onSign).toHaveBeenCalledOnce()
    expect(onSign).toHaveBeenCalledWith('message', input)
  })

  it('is a no-op when lifecycle is undefined', () => {
    expect(() => {
      fireWalletLifecycle('onSign', undefined, 'message', { message: 'hello' })
    }).not.toThrow()
  })

  it('is a no-op when the specific hook is not defined on the lifecycle object', () => {
    const lifecycle: WalletLifecycle = {}

    expect(() => {
      fireWalletLifecycle('onSign', lifecycle, 'message', { message: 'hello' })
    }).not.toThrow()
  })

  it('catches and logs errors thrown by lifecycle hooks', () => {
    const error = new Error('hook boom')
    const onSignComplete = vi.fn(() => {
      throw error
    })
    const lifecycle: WalletLifecycle = { onSignComplete }
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    fireWalletLifecycle('onSignComplete', lifecycle, {
      signature: '0x',
      address: '0xabc',
    } as SignatureResult)

    expect(consoleSpy).toHaveBeenCalledOnce()
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('onSignComplete'), error)
    consoleSpy.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const makeMockAdapter = (overrides?: Partial<WalletAdapter>): WalletAdapter =>
  ({
    chainType: 'evm',
    supportedChains: [],
    metadata: {
      chainType: 'evm',
      capabilities: { signTypedData: false, switchChain: false },
      formatAddress: (addr: string) => addr,
      availableWallets: () => [],
    },
    connect: vi.fn(),
    reconnect: vi.fn(),
    disconnect: vi.fn(),
    getStatus: vi.fn(),
    onStatusChange: vi.fn(),
    signMessage: vi.fn(),
    getSigner: vi.fn(),
    switchChain: vi.fn(),
    ...overrides,
  }) as unknown as WalletAdapter

// ---------------------------------------------------------------------------
// wrapSignMessage
// ---------------------------------------------------------------------------

describe('wrapSignMessage', () => {
  it('delegates to adapter.signMessage and returns the result', async () => {
    const expectedResult: SignatureResult = { signature: '0xsig', address: '0xabc' }
    const adapter = makeMockAdapter({
      signMessage: vi.fn().mockResolvedValue(expectedResult),
    })

    const sign = wrapSignMessage(adapter, undefined)
    const result = await sign({ message: 'hello' })

    expect(adapter.signMessage).toHaveBeenCalledWith({ message: 'hello' })
    expect(result).toBe(expectedResult)
  })

  it('fires onSign before signing and onSignComplete after', async () => {
    const expectedResult: SignatureResult = { signature: '0xsig', address: '0xabc' }
    const adapter = makeMockAdapter({
      signMessage: vi.fn().mockResolvedValue(expectedResult),
    })
    const onSign = vi.fn()
    const onSignComplete = vi.fn()
    const lifecycle: WalletLifecycle = { onSign, onSignComplete }

    const sign = wrapSignMessage(adapter, lifecycle)
    await sign({ message: 'hello' })

    expect(onSign).toHaveBeenCalledWith('message', { message: 'hello' })
    expect(onSignComplete).toHaveBeenCalledWith(expectedResult)
  })

  it('fires onSignError and re-throws when adapter.signMessage fails', async () => {
    const signingError = new Error('user rejected')
    const adapter = makeMockAdapter({
      signMessage: vi.fn().mockRejectedValue(signingError),
    })
    const onSignError = vi.fn()
    const lifecycle: WalletLifecycle = { onSignError }

    const sign = wrapSignMessage(adapter, lifecycle)

    await expect(sign({ message: 'hello' })).rejects.toThrow('user rejected')
    expect(onSignError).toHaveBeenCalledWith(signingError)
  })

  it('wraps non-Error thrown values in an Error for onSignError', async () => {
    const adapter = makeMockAdapter({
      signMessage: vi.fn().mockRejectedValue('string error'),
    })
    const onSignError = vi.fn()
    const lifecycle: WalletLifecycle = { onSignError }

    const sign = wrapSignMessage(adapter, lifecycle)

    await expect(sign({ message: 'hello' })).rejects.toBe('string error')
    expect(onSignError).toHaveBeenCalledWith(expect.any(Error))
    expect(onSignError.mock.calls[0][0].message).toBe('string error')
  })
})

// ---------------------------------------------------------------------------
// wrapSignTypedData
// ---------------------------------------------------------------------------

describe('wrapSignTypedData', () => {
  it('returns undefined when adapter lacks signTypedData capability', () => {
    const adapter = makeMockAdapter()
    const result = wrapSignTypedData(adapter, undefined)
    expect(result).toBeUndefined()
  })

  it('delegates to adapter.signTypedData and returns the result', async () => {
    const expectedResult: SignatureResult = { signature: '0xsig', address: '0xabc' }
    const signTypedData = vi.fn().mockResolvedValue(expectedResult)
    const adapter = makeMockAdapter({ signTypedData })
    const input: SignTypedDataInput = {
      domain: {},
      types: {},
      primaryType: 'Test',
      message: {},
    }

    const wrapped = wrapSignTypedData(adapter, undefined)
    if (!wrapped) {
      throw new Error('expected wrapSignTypedData to return a function')
    }
    const result = await wrapped(input)

    expect(signTypedData).toHaveBeenCalledWith(input)
    expect(result).toBe(expectedResult)
  })

  it('fires onSign before signing and onSignComplete after', async () => {
    const expectedResult: SignatureResult = { signature: '0xsig', address: '0xabc' }
    const signTypedData = vi.fn().mockResolvedValue(expectedResult)
    const adapter = makeMockAdapter({ signTypedData })
    const onSign = vi.fn()
    const onSignComplete = vi.fn()
    const lifecycle: WalletLifecycle = { onSign, onSignComplete }
    const input: SignTypedDataInput = {
      domain: {},
      types: {},
      primaryType: 'Test',
      message: {},
    }

    const wrapped = wrapSignTypedData(adapter, lifecycle)
    if (!wrapped) {
      throw new Error('expected wrapSignTypedData to return a function')
    }
    await wrapped(input)

    expect(onSign).toHaveBeenCalledWith('typedData', input)
    expect(onSignComplete).toHaveBeenCalledWith(expectedResult)
  })

  it('fires onSignError and re-throws when adapter.signTypedData fails', async () => {
    const signingError = new Error('typed data rejected')
    const signTypedData = vi.fn().mockRejectedValue(signingError)
    const adapter = makeMockAdapter({ signTypedData })
    const onSignError = vi.fn()
    const lifecycle: WalletLifecycle = { onSignError }
    const input: SignTypedDataInput = {
      domain: {},
      types: {},
      primaryType: 'Test',
      message: {},
    }

    const wrapped = wrapSignTypedData(adapter, lifecycle)
    if (!wrapped) {
      throw new Error('expected wrapSignTypedData to return a function')
    }

    await expect(wrapped(input)).rejects.toThrow('typed data rejected')
    expect(onSignError).toHaveBeenCalledWith(signingError)
  })
})
