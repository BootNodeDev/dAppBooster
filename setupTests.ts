import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'

expect.extend(matchers)

// ResizeObserver is not implemented in jsdom but required by @floating-ui (Chakra menus/popovers).
// Use a real class rather than vi.fn() so vi.restoreAllMocks() in test files cannot clear it.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserver {
    // biome-ignore lint/suspicious/noExplicitAny: stub for jsdom test environment
    observe(_target: any) {}
    // biome-ignore lint/suspicious/noExplicitAny: stub for jsdom test environment
    unobserve(_target: any) {}
    disconnect() {}
  }
  // @ts-expect-error ResizeObserver is not in the Node/jsdom type definitions
  globalThis.ResizeObserver = ResizeObserver
}

afterEach(() => {
  cleanup()
})
