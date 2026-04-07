import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Migration test: AddERC20TokenButton must use useWallet from the SDK instead of useWeb3Status.
 */
describe('AddERC20TokenButton migration', () => {
  it('does not import from @/src/wallet/hooks', () => {
    const source = readFileSync(resolve(__dirname, './AddERC20TokenButton.tsx'), 'utf-8')
    expect(source).not.toContain('@/src/wallet/hooks')
  })

  it('imports useWallet from @/src/sdk/react/hooks', () => {
    const source = readFileSync(resolve(__dirname, './AddERC20TokenButton.tsx'), 'utf-8')
    expect(source).toContain("from '@/src/sdk/react/hooks'")
  })

  it('imports useWalletClient from wagmi', () => {
    const source = readFileSync(resolve(__dirname, './AddERC20TokenButton.tsx'), 'utf-8')
    expect(source).toContain("from 'wagmi'")
    expect(source).toContain('useWalletClient')
  })
})
