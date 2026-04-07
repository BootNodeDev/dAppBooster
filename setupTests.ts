import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'

expect.extend(matchers)

// jsdom does not implement ResizeObserver; stub it so floating-ui / Chakra popper tests don't throw.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

afterEach(() => {
  cleanup()
})
