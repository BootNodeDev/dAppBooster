/**
 * Wraps every function method on an adapter with optional before/after/error hooks.
 * Returns a new object with identical interface; original adapter is untouched.
 * Hooks are fire-and-forget: hook errors are caught and ignored to avoid aborting adapter calls.
 */

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

export function wrapAdapter<T extends object>(
  adapter: T,
  hooks: {
    onBefore?(method: string, args: unknown[]): void
    onAfter?(method: string, result: unknown): void
    onError?(method: string, error: Error): void
  },
): T {
  const wrapped: Record<string, unknown> = {}

  for (const key of collectMethodKeys(adapter as object)) {
    const value = (adapter as Record<string, unknown>)[key]
    if (typeof value !== 'function') {
      wrapped[key] = value
      continue
    }
    wrapped[key] = function wrappedMethod(...args: unknown[]) {
      try {
        hooks.onBefore?.(key, args)
      } catch {
        // hook errors are caught and ignored
      }

      let result: unknown
      try {
        result = (value as (...a: unknown[]) => unknown).apply(adapter, args)
      } catch (error) {
        try {
          hooks.onError?.(key, error instanceof Error ? error : new Error(String(error)))
        } catch {
          // hook errors are caught and ignored
        }
        throw error
      }

      // Async method: wire after/error hooks onto the returned Promise
      if (result instanceof Promise) {
        return (result as Promise<unknown>)
          .then((resolved: unknown) => {
            try {
              hooks.onAfter?.(key, resolved)
            } catch {
              // hook errors are caught and ignored
            }
            return resolved
          })
          .catch((error: unknown) => {
            try {
              hooks.onError?.(key, error instanceof Error ? error : new Error(String(error)))
            } catch {
              // hook errors are caught and ignored
            }
            throw error
          })
      }

      // Synchronous method: fire after hook immediately
      try {
        hooks.onAfter?.(key, result)
      } catch {
        // hook errors are caught and ignored
      }
      return result
    }
  }

  return wrapped as T
}
