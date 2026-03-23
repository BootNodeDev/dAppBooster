import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { withSuspense, withSuspenseAndRetry } from './suspenseWrapper'

const system = createSystem(defaultConfig)

// Silence expected React error boundary console.errors
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

function wrap(ui: ReactNode, withQuery = false) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const inner = withQuery ? (
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  ) : (
    ui
  )
  return render(<ChakraProvider value={system}>{inner}</ChakraProvider>)
}

const NormalComponent = () => <div>Normal Content</div>
const SuspendedComponent = () => {
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw new Promise(() => {})
}

function makeErrorComponent(message: string) {
  return function ErrorComponent() {
    throw new Error(message)
  }
}

describe('withSuspense', () => {
  it('renders the wrapped component when no error or suspension', () => {
    const Wrapped = withSuspense(NormalComponent)
    wrap(<Wrapped />)
    expect(screen.getByText('Normal Content')).toBeDefined()
  })

  it('shows custom suspense fallback while component is suspended', () => {
    const Wrapped = withSuspense(SuspendedComponent)
    wrap(<Wrapped suspenseFallback={<div>Loading...</div>} />)
    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('shows default error message when component throws', async () => {
    const Wrapped = withSuspense(makeErrorComponent('boom'))
    wrap(<Wrapped />)
    await waitFor(() => {
      expect(screen.getByText('Something went wrong...')).toBeDefined()
    })
  })

  it('shows custom errorFallback text when provided', async () => {
    const Wrapped = withSuspense(makeErrorComponent('boom'))
    wrap(<Wrapped errorFallback="Custom error text" />)
    await waitFor(() => {
      expect(screen.getByText('Custom error text')).toBeDefined()
    })
  })
})

describe('withSuspenseAndRetry', () => {
  it('renders the wrapped component when no error or suspension', () => {
    const Wrapped = withSuspenseAndRetry(NormalComponent)
    wrap(<Wrapped />, true)
    expect(screen.getByText('Normal Content')).toBeDefined()
  })

  it('shows custom suspense fallback while component is suspended', () => {
    const Wrapped = withSuspenseAndRetry(SuspendedComponent)
    wrap(<Wrapped suspenseFallback={<div>Loading...</div>} />, true)
    expect(screen.getByText('Loading...')).toBeDefined()
  })

  it('shows error message and Try Again button when component throws', async () => {
    const Wrapped = withSuspenseAndRetry(makeErrorComponent('Fetch failed'))
    wrap(<Wrapped />, true)
    await waitFor(() => {
      expect(screen.getByText('Fetch failed')).toBeDefined()
      expect(screen.getByText('Try Again')).toBeDefined()
    })
  })

  it('resets error boundary when Try Again is clicked', async () => {
    // Use an external flag so React 19 retries also throw (React retries after first throw
    // before giving up to the error boundary, which would reset renderCount-based approaches)
    const state = { shouldThrow: true }
    const RecoveryComponent = () => {
      if (state.shouldThrow) throw new Error('Persistent error')
      return <div>Recovered</div>
    }

    const Wrapped = withSuspenseAndRetry(RecoveryComponent)
    wrap(<Wrapped />, true)

    await waitFor(() => {
      expect(screen.getByText('Persistent error')).toBeDefined()
    })

    state.shouldThrow = false
    fireEvent.click(screen.getByText('Try Again'))

    await waitFor(() => {
      expect(screen.getByText('Recovered')).toBeDefined()
    })
  })
})
