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

  describe('transforming hooks', () => {
    it('beforeCall can modify the arguments passed to the method', async () => {
      const adapter = { greet: async (name: string) => `hello ${name}` }
      const wrapped = wrapAdapter(adapter, {
        beforeCall(_method, args) {
          return [`${args[0]}!`]
        },
      })
      const result = await wrapped.greet('world')
      expect(result).toBe('hello world!')
    })

    it('beforeCall returning the input unchanged acts as pass-through', async () => {
      const adapter = { greet: async (name: string) => `hello ${name}` }
      const wrapped = wrapAdapter(adapter, {
        beforeCall(_method, args) {
          return args
        },
      })
      const result = await wrapped.greet('world')
      expect(result).toBe('hello world')
    })

    it('afterCall can modify the result', async () => {
      const adapter = { getValue: async () => 42 }
      const wrapped = wrapAdapter(adapter, {
        afterCall(_method, result) {
          return (result as number) * 2
        },
      })
      const result = await wrapped.getValue()
      expect(result).toBe(84)
    })

    it('afterCall returning the input unchanged acts as pass-through', async () => {
      const adapter = { getValue: async () => 42 }
      const wrapped = wrapAdapter(adapter, {
        afterCall(_method, result) {
          return result
        },
      })
      const result = await wrapped.getValue()
      expect(result).toBe(42)
    })

    it('beforeCall runs before onBefore', async () => {
      const order: string[] = []
      const adapter = { doWork: async () => 'done' }
      const wrapped = wrapAdapter(adapter, {
        beforeCall(_method, args) {
          order.push('beforeCall')
          return args
        },
        onBefore() {
          order.push('onBefore')
        },
      })
      await wrapped.doWork()
      expect(order).toEqual(['beforeCall', 'onBefore'])
    })

    it('afterCall runs after onAfter', async () => {
      const order: string[] = []
      const adapter = { doWork: async () => 'done' }
      const wrapped = wrapAdapter(adapter, {
        onAfter() {
          order.push('onAfter')
        },
        afterCall(_method, result) {
          order.push('afterCall')
          return result
        },
      })
      await wrapped.doWork()
      expect(order).toEqual(['onAfter', 'afterCall'])
    })

    it('full execution order: beforeCall -> onBefore -> method -> onAfter -> afterCall', async () => {
      const order: string[] = []
      const adapter = {
        doWork: async () => {
          order.push('method')
          return 'done'
        },
      }
      const wrapped = wrapAdapter(adapter, {
        beforeCall(_method, args) {
          order.push('beforeCall')
          return args
        },
        onBefore() {
          order.push('onBefore')
        },
        onAfter() {
          order.push('onAfter')
        },
        afterCall(_method, result) {
          order.push('afterCall')
          return result
        },
      })
      await wrapped.doWork()
      expect(order).toEqual(['beforeCall', 'onBefore', 'method', 'onAfter', 'afterCall'])
    })

    it('beforeCall errors abort the call (not fire-and-forget)', () => {
      const adapter = { doWork: async () => 'done' }
      const wrapped = wrapAdapter(adapter, {
        beforeCall() {
          throw new Error('beforeCall failed')
        },
      })
      expect(() => wrapped.doWork()).toThrow('beforeCall failed')
    })

    it('afterCall errors abort the call (not fire-and-forget)', async () => {
      const adapter = { doWork: async () => 'done' }
      const wrapped = wrapAdapter(adapter, {
        afterCall() {
          throw new Error('afterCall failed')
        },
      })
      await expect(wrapped.doWork()).rejects.toThrow('afterCall failed')
    })

    it('works with synchronous methods', () => {
      const adapter = { getValue: () => 42 }
      const wrapped = wrapAdapter(adapter, {
        afterCall(_method, result) {
          return (result as number) * 2
        },
      })
      const result = wrapped.getValue()
      expect(result).toBe(84)
      expect(result).not.toBeInstanceOf(Promise)
    })

    it('beforeCall can transform args for synchronous methods', () => {
      const adapter = { greet: (name: string) => `hello ${name}` }
      const wrapped = wrapAdapter(adapter, {
        beforeCall(_method, args) {
          return [`${args[0]}!`]
        },
      })
      const result = wrapped.greet('world')
      expect(result).toBe('hello world!')
      expect(result).not.toBeInstanceOf(Promise)
    })
  })
})
