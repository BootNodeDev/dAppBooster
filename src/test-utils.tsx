import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Chain } from 'viem'

const system = createSystem(defaultConfig)

/**
 * Wraps a component in the providers needed for most tests.
 */
export function renderWithProviders(ui: ReactNode) {
  return render(<ChakraProvider value={system}>{ui}</ChakraProvider>)
}

/**
 * Returns a minimal mock of the useWeb3Status return value.
 * Pass overrides to test specific states.
 */
export function createMockWeb3Status(overrides?: Partial<ReturnType<typeof _mockShape>>) {
  return { ..._mockShape(), ...overrides }
}

function _mockShape() {
  return {
    address: undefined as `0x${string}` | undefined,
    isConnected: false,
    isConnecting: false,
    isDisconnected: true,
    chainId: undefined as number | undefined,
    balance: undefined,
    publicClient: undefined,
    walletClient: undefined,
    disconnect: () => {},
    switchChain: undefined,
  }
}

/**
 * Returns a minimal valid viem Chain object for tests.
 */
export function createMockChain(overrides?: Partial<Chain>): Chain {
  return {
    id: 1,
    name: 'Mock Chain',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://mock.rpc.url'] } },
    blockExplorers: {
      default: { name: 'MockExplorer', url: 'https://mock.explorer.url' },
    },
    ...overrides,
  } as Chain
}
