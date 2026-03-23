import { zeroAddress } from 'viem'
import { describe, expect, it } from 'vitest'

// env.ts reads import.meta.env at module load time.
// Vitest loads .env.test automatically for the "test" mode,
// so PUBLIC_APP_NAME, PUBLIC_SUBGRAPHS_*, etc. are set via .env.test.
import { env } from './env'

describe('env', () => {
  it('exposes PUBLIC_APP_NAME from test env', () => {
    expect(env.PUBLIC_APP_NAME).toBe('dAppBooster Test')
  })

  it('reads and normalizes PUBLIC_NATIVE_TOKEN_ADDRESS from env', () => {
    // .env.test sets it to the zero address; the schema lowercases the value
    expect(env.PUBLIC_NATIVE_TOKEN_ADDRESS).toBe(zeroAddress.toLowerCase())
  })

  it('lowercases PUBLIC_NATIVE_TOKEN_ADDRESS', () => {
    expect(env.PUBLIC_NATIVE_TOKEN_ADDRESS).toBe(env.PUBLIC_NATIVE_TOKEN_ADDRESS.toLowerCase())
  })

  it('defaults PUBLIC_ENABLE_PORTO to true', () => {
    expect(env.PUBLIC_ENABLE_PORTO).toBe(true)
  })

  it('defaults PUBLIC_USE_DEFAULT_TOKENS to true', () => {
    expect(env.PUBLIC_USE_DEFAULT_TOKENS).toBe(true)
  })

  it('defaults PUBLIC_INCLUDE_TESTNETS to true', () => {
    expect(env.PUBLIC_INCLUDE_TESTNETS).toBe(true)
  })

  it('reads PUBLIC_SUBGRAPHS_ENVIRONMENT from test env', () => {
    // .env.test sets it to 'production'; to test the schema default use vi.resetModules()
    expect(env.PUBLIC_SUBGRAPHS_ENVIRONMENT).toBe('production')
  })

  it('exposes PUBLIC_SUBGRAPHS_API_KEY from test env', () => {
    expect(env.PUBLIC_SUBGRAPHS_API_KEY).toBe('test-api-key')
  })

  it('exposes PUBLIC_WALLETCONNECT_PROJECT_ID from test env', () => {
    // .env.test sets it to 'test-project-id'
    expect(env.PUBLIC_WALLETCONNECT_PROJECT_ID).toBe('test-project-id')
  })

  it('optional RPC vars are undefined when not set in test env', () => {
    // None of the RPC vars are set in .env.test
    expect(env.PUBLIC_RPC_MAINNET).toBeUndefined()
    expect(env.PUBLIC_RPC_SEPOLIA).toBeUndefined()
  })
})
