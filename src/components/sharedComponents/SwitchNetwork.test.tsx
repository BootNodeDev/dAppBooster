import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SwitchNetwork, { type Networks } from './SwitchNetwork'

const system = createSystem(defaultConfig)

vi.mock('@/src/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(),
}))

vi.mock('wagmi', () => ({
  useSwitchChain: vi.fn(),
}))

import * as useWeb3StatusModule from '@/src/hooks/useWeb3Status'
import * as wagmiModule from 'wagmi'

const mockNetworks: Networks = [
  { id: 1, label: 'Ethereum', icon: <span>ETH</span> },
  { id: 137, label: 'Polygon', icon: <span>MATIC</span> },
]

function defaultWeb3Status(overrides = {}) {
  return {
    isWalletConnected: true,
    walletChainId: undefined as number | undefined,
    walletClient: undefined,
    ...overrides,
  }
}

function defaultSwitchChain() {
  return {
    chains: [
      { id: 1, name: 'Ethereum' },
      { id: 137, name: 'Polygon' },
    ],
    switchChain: vi.fn(),
  }
}

function renderSwitchNetwork(networks = mockNetworks) {
  return render(
    <ChakraProvider value={system}>
      <SwitchNetwork networks={networks} />
    </ChakraProvider>,
  )
}

describe('SwitchNetwork', () => {
  it('shows "Select a network" when wallet chain does not match any network', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      defaultWeb3Status({ walletChainId: 999 }) as any,
    )
    vi.mocked(wagmiModule.useSwitchChain).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      defaultSwitchChain() as any,
    )
    renderSwitchNetwork()
    expect(screen.getByText('Select a network')).toBeDefined()
  })

  it('shows current network label when wallet is on a listed chain', async () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      defaultWeb3Status({ walletChainId: 1 }) as any,
    )
    vi.mocked(wagmiModule.useSwitchChain).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      defaultSwitchChain() as any,
    )
    renderSwitchNetwork()
    expect(screen.getByText('Ethereum')).toBeDefined()
  })

  it('trigger button is disabled when wallet not connected', () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      defaultWeb3Status({ isWalletConnected: false }) as any,
    )
    vi.mocked(wagmiModule.useSwitchChain).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      defaultSwitchChain() as any,
    )
    renderSwitchNetwork()
    const button = screen.getByRole('button')
    expect(button).toBeDefined()
    expect(button.hasAttribute('disabled') || button.getAttribute('data-disabled') !== null).toBe(
      true,
    )
  })

  it('shows all network options in the menu after opening it', async () => {
    vi.mocked(useWeb3StatusModule.useWeb3Status).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      defaultWeb3Status({ isWalletConnected: true }) as any,
    )
    vi.mocked(wagmiModule.useSwitchChain).mockReturnValue(
      // biome-ignore lint/suspicious/noExplicitAny: partial mock
      defaultSwitchChain() as any,
    )
    renderSwitchNetwork()

    // Open the menu by clicking the trigger
    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Ethereum')).toBeDefined()
      expect(screen.getByText('Polygon')).toBeDefined()
    })
  })
})
