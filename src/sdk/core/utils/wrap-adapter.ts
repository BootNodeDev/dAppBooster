/**
 * Wraps every function method on an adapter with optional observation and transform hooks.
 * Returns a new object with identical interface; original adapter is untouched.
 *
 * Observation hooks (`onBefore`, `onAfter`, `onError`) are fire-and-forget: hook errors are
 * caught and ignored to avoid aborting adapter calls.
 *
 * Transform hooks (`beforeCall`, `afterCall`) propagate errors and can modify args/results.
 * Returning `void` from a transform hook passes the original value through.
 */

/** Hook configuration for `wrapAdapter`. */
export interface WrapAdapterHooks {
  /**
   * Transform hook that runs before the method call.
   * Always return an args array — return the input unchanged for pass-through.
   * Errors propagate (not fire-and-forget).
   *
   * @expects args is the original arguments array
   * @postcondition returned array replaces args for the method call
   * @throws any error thrown here aborts the method call
   */
  beforeCall?(method: string, args: unknown[]): unknown[]
  /**
   * Observation hook that runs after `beforeCall` and before the method executes.
   * Fire-and-forget: errors are caught and ignored.
   */
  onBefore?(method: string, args: unknown[]): void
  /**
   * Observation hook that runs after the method returns (before `afterCall`).
   * Fire-and-forget: errors are caught and ignored.
   */
  onAfter?(method: string, result: unknown): void
  /**
   * Observation hook that runs when the method throws or rejects.
   * Fire-and-forget: errors are caught and ignored.
   */
  onError?(method: string, error: Error): void
  /**
   * Transform hook that runs after `onAfter`.
   * Always return a value — return the input unchanged for pass-through.
   * Errors propagate (not fire-and-forget).
   *
   * @expects result is the resolved value from the method
   * @postcondition returned value replaces the method result
   * @throws any error thrown here aborts the call
   */
  afterCall?(method: string, result: unknown): unknown
}

/** Collects own + inherited enumerable property keys up to (but not including) Object.prototype. */
function collectMethodKeys(obj: object): string[] {
  const keys = new Set<string>()
  let current: object | null = obj
  while (current !== null && current !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(current)) {
      keys.add(key)
    }
    current = Object.getPrototypeOf(current) as object | null
  }
  return [...keys]
}

/**
 * Wraps every function method on an adapter with optional observation and transform hooks.
 *
 * Execution order: `beforeCall` -> `onBefore` -> method -> `onAfter` -> `afterCall`
 *
 * @expects adapter is a non-null object
 * @postcondition returned object has the same interface as adapter with hooks applied
 * @throws errors from `beforeCall`/`afterCall` propagate; observation hook errors are swallowed
 */
export function wrapAdapter<T extends object>(adapter: T, hooks: WrapAdapterHooks): T {
  const wrapped: Record<string, unknown> = {}

  for (const key of collectMethodKeys(adapter as object)) {
    const value = (adapter as Record<string, unknown>)[key]
    if (typeof value !== 'function') {
      wrapped[key] = value
      continue
    }
    wrapped[key] = function wrappedMethod(...args: unknown[]) {
      // 1. beforeCall — transform hook, errors propagate
      const effectiveArgs = hooks.beforeCall ? hooks.beforeCall(key, args) : args

      // 2. onBefore — observation hook, fire-and-forget
      try {
        hooks.onBefore?.(key, effectiveArgs)
      } catch {
        // observation hook errors are caught and ignored
      }

      // 3. Execute the method
      let result: unknown
      try {
        result = (value as (...a: unknown[]) => unknown).apply(adapter, effectiveArgs)
      } catch (error) {
        try {
          hooks.onError?.(key, error instanceof Error ? error : new Error(String(error)))
        } catch {
          // observation hook errors are caught and ignored
        }
        throw error
      }

      // Async method: wire after/error hooks onto the returned Promise
      if (result instanceof Promise) {
        return (result as Promise<unknown>)
          .then((resolved: unknown) => {
            // 4. onAfter — observation hook, fire-and-forget
            try {
              hooks.onAfter?.(key, resolved)
            } catch {
              // observation hook errors are caught and ignored
            }

            // 5. afterCall — transform hook, errors propagate
            return hooks.afterCall ? hooks.afterCall(key, resolved) : resolved
          })
          .catch((error: unknown) => {
            try {
              hooks.onError?.(key, error instanceof Error ? error : new Error(String(error)))
            } catch {
              // observation hook errors are caught and ignored
            }
            throw error
          })
      }

      // Synchronous method: fire hooks immediately
      // 4. onAfter — observation hook, fire-and-forget
      try {
        hooks.onAfter?.(key, result)
      } catch {
        // observation hook errors are caught and ignored
      }

      // 5. afterCall — transform hook, errors propagate
      return hooks.afterCall ? hooks.afterCall(key, result) : result
    }
  }

  return wrapped as T
}
