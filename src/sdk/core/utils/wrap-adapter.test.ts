import { describe, expect, it } from 'vitest'

import { wrapAdapter } from './wrap-adapter'

describe('wrapAdapter', () => {
  it('calls onBefore hook before the method runs', async () => {
    const calls: string[] = []
    const adapter = { greet: async (name: string) => `hello ${name}` }
    const wrapped = wrapAdapter(adapter, {
      onBefore(method, args) {
        calls.push(`before:${method}:${args[0]}`)
      },
    })
    await wrapped.greet('world')
    expect(calls).toContain('before:greet:world')
  })

  it('calls onAfter hook after the method returns', async () => {
    const results: unknown[] = []
    const adapter = { getValue: async () => 42 }
    const wrapped = wrapAdapter(adapter, {
      onAfter(_method, result) {
        results.push(result)
      },
    })
    await wrapped.getValue()
    expect(results).toContain(42)
  })

  it('fires hooks in order: onBefore → method → onAfter', async () => {
    const order: string[] = []
    const adapter = {
      doWork: async () => {
        order.push('method')
        return 'done'
      },
    }
    const wrapped = wrapAdapter(adapter, {
      onBefore() {
        order.push('before')
      },
      onAfter() {
        order.push('after')
      },
    })
    await wrapped.doWork()
    expect(order).toEqual(['before', 'method', 'after'])
  })

  it('onError fires when method throws, and the error is still propagated', async () => {
    const errors: string[] = []
    const adapter = {
      failingMethod: async () => {
        throw new Error('boom')
      },
    }
    const wrapped = wrapAdapter(adapter, {
      onError(_method, error) {
        errors.push(error.message)
      },
    })
    await expect(wrapped.failingMethod()).rejects.toThrow('boom')
    expect(errors).toContain('boom')
  })

  it('hook errors are silently swallowed — method still succeeds', async () => {
    const adapter = { getValue: async () => 42 }
    const wrapped = wrapAdapter(adapter, {
      onBefore() {
        throw new Error('hook error')
      },
    })
    const result = await wrapped.getValue()
    expect(result).toBe(42)
  })

  it('non-function properties are preserved', () => {
    const adapter = { chainType: 'evm', connect: async () => 'ok' }
    const wrapped = wrapAdapter(adapter, {})
    expect(wrapped.chainType).toBe('evm')
  })

  it('preserves synchronous methods as synchronous', () => {
    const adapter = { getStatus: () => ({ connected: true }) }
    const wrapped = wrapAdapter(adapter, {})
    const result = wrapped.getStatus()
    // result should NOT be a Promise — it's a sync return
    expect(result).toEqual({ connected: true })
    expect(result).not.toBeInstanceOf(Promise)
  })

  it('hooks fire in order for synchronous methods', () => {
    const order: string[] = []
    const adapter = {
      getChainId: () => {
        order.push('method')
        return 1
      },
    }
    const wrapped = wrapAdapter(adapter, {
      onBefore() {
        order.push('before')
      },
      onAfter() {
        order.push('after')
      },
    })
    wrapped.getChainId()
    expect(order).toEqual(['before', 'method', 'after'])
  })
})
