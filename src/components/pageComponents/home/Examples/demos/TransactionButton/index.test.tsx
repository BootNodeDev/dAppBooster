import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createMockWeb3Status, renderWithProviders } from '@/src/test-utils'
import transactionButton from './index'

vi.mock('@/src/wallet/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(() => createMockWeb3Status({ appChainId: 11155420 })),
}))

vi.mock('@/src/wallet/providers', () => ({
  ConnectWalletButton: () => <button type="button">Connect Wallet</button>,
}))

vi.mock('@/src/sdk/react/hooks', () => ({
  useWallet: vi.fn(() => ({
    needsConnect: true,
    needsChainSwitch: false,
    isReady: false,
    status: { connected: false, connecting: false, activeAccount: null, connectedChainIds: [] },
    switchChain: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    signMessage: vi.fn(),
    getSigner: vi.fn(),
  })),
  useTransaction: vi.fn(() => ({
    phase: 'idle',
    execute: vi.fn(),
    reset: vi.fn(),
    prepareResult: null,
    ref: null,
    result: null,
    preStepResults: [],
    explorerUrl: null,
    error: null,
  })),
  useChainRegistry: vi.fn(() => ({
    getChain: vi.fn(() => null),
    getChainByCaip2: vi.fn(() => null),
    getChainType: vi.fn(() => null),
    getChainsByType: vi.fn(() => []),
    getAllChains: vi.fn(() => []),
  })),
}))

describe('TransactionButton demo', () => {
  it('renders connect wallet fallback when wallet not connected', () => {
    renderWithProviders(transactionButton.demo)
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeDefined()
  })
})
