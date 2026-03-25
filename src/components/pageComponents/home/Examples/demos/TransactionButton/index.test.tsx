import { createMockWeb3Status, renderWithProviders } from '@/src/test-utils'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import transactionButton from './index'

vi.mock('@/src/hooks/useWeb3Status', () => ({
  useWeb3Status: vi.fn(() => createMockWeb3Status({ appChainId: 11155420 })),
}))

vi.mock('@/src/providers/Web3Provider', () => ({
  ConnectWalletButton: () => <button type="button">Connect Wallet</button>,
}))

describe('TransactionButton demo', () => {
  it('renders connect wallet fallback when wallet not connected', () => {
    renderWithProviders(transactionButton.demo)
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeDefined()
  })
})
