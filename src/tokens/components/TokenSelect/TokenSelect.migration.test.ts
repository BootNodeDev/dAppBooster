import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Migration test: TokenSelect must use useWallet and useChainRegistry from the SDK instead of useWeb3Status.
 */
describe('TokenSelect migration', () => {
  it('does not import from @/src/wallet/hooks', () => {
    const source = readFileSync(resolve(__dirname, './index.tsx'), 'utf-8')
    expect(source).not.toContain('@/src/wallet/hooks')
  })

  it('imports useWallet from @/src/sdk/react/hooks', () => {
    const source = readFileSync(resolve(__dirname, './index.tsx'), 'utf-8')
    expect(source).toContain("from '@/src/sdk/react/hooks'")
  })

  it('imports useChainRegistry from @/src/sdk/react/hooks', () => {
    const source = readFileSync(resolve(__dirname, './index.tsx'), 'utf-8')
    expect(source).toContain('useChainRegistry')
  })
})
