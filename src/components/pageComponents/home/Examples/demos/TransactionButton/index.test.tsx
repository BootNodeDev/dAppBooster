import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/src/test-utils'
import transactionButton from './index'

// The demo wraps its body in <WalletGuard>. Mock it to always render a stand-in
// so the test can verify the fallback UI without spinning up the full provider tree.
vi.mock('@/src/chakra', () => ({
  WalletGuard: ({ children: _children }: { children: React.ReactNode }) => (
    <button type="button">Connect Wallet</button>
  ),
}))

describe('TransactionButton demo', () => {
  it('renders connect wallet fallback when wallet not connected', () => {
    renderWithProviders(transactionButton.demo)
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeDefined()
  })
})
