import fc from 'fast-check'
import { describe, expect, it, vi } from 'vitest'

import { wrapAdapter } from './wrap-adapter'

const methodNameArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]{0,15}$/)
const isAsyncArb = fc.boolean()

describe('wrapAdapter — hook invariants', () => {
  it('onBefore fires before the method body, exactly once per call', () => {
    fc.assert(
      fc.asyncProperty(methodNameArb, isAsyncArb, async (methodName, isAsync) => {
        const events: string[] = []
        const method = isAsync
          ? async () => {
              events.push('method')
              return 'result'
            }
          : () => {
              events.push('method')
              return 'result'
            }
        const adapter = { [methodName]: method }
        const wrapped = wrapAdapter(adapter, {
          onBefore: () => {
            events.push('onBefore')
          },
        })

        const fn = (wrapped as Record<string, unknown>)[methodName]
        if (typeof fn !== 'function') return
        const ret = (fn as () => unknown)()
        if (ret instanceof Promise) await ret

        expect(events.filter((event) => event === 'onBefore')).toHaveLength(1)
        expect(events.indexOf('onBefore')).toBeLessThan(events.indexOf('method'))
      }),
    )
  })

  it('onAfter OR onError fires exactly once per call (never both)', () => {
    fc.assert(
      fc.asyncProperty(isAsyncArb, fc.boolean(), async (isAsync, shouldThrow) => {
        const onAfter = vi.fn()
        const onError = vi.fn()
        const method = isAsync
          ? async () => {
              if (shouldThrow) {
                throw new Error('boom')
              }
              return 'ok'
            }
          : () => {
              if (shouldThrow) {
                throw new Error('boom')
              }
              return 'ok'
            }
        const wrapped = wrapAdapter({ run: method }, { onAfter, onError })

        try {
          const ret = wrapped.run()
          if (ret instanceof Promise) await ret
        } catch {
          // expected when shouldThrow is true
        }

        const totalCalls = onAfter.mock.calls.length + onError.mock.calls.length
        expect(totalCalls).toBe(1)
        if (shouldThrow) {
          expect(onError).toHaveBeenCalledTimes(1)
          expect(onAfter).not.toHaveBeenCalled()
        } else {
          expect(onAfter).toHaveBeenCalledTimes(1)
          expect(onError).not.toHaveBeenCalled()
        }
      }),
    )
  })

  it('observation-hook errors never propagate to the caller', () => {
    fc.assert(
      fc.asyncProperty(isAsyncArb, fc.boolean(), async (isAsync, methodThrows) => {
        const method = isAsync
          ? async () => {
              if (methodThrows) {
                throw new Error('method-failure')
              }
              return 'ok'
            }
          : () => {
              if (methodThrows) {
                throw new Error('method-failure')
              }
              return 'ok'
            }
        const wrapped = wrapAdapter(
          { run: method },
          {
            onBefore: () => {
              throw new Error('onBefore failed')
            },
            onAfter: () => {
              throw new Error('onAfter failed')
            },
            onError: () => {
              throw new Error('onError failed')
            },
          },
        )

        // The only error that should propagate is the method's own
        let caught: unknown = null
        try {
          const ret = wrapped.run()
          if (ret instanceof Promise) await ret
        } catch (error) {
          caught = error
        }

        if (methodThrows) {
          expect(caught).toBeInstanceOf(Error)
          expect((caught as Error).message).toBe('method-failure')
        } else {
          expect(caught).toBeNull()
        }
      }),
    )
  })
})
