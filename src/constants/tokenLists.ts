import { aaveSepoliaFaucetTokens } from '@/src/constants/aaveSepoliaFaucet'
import { includeTestnets } from '@/src/constants/common'
import type { TokenList } from '@/src/types/token'

/**
 * @dev Here you can add the list of tokens you want to use in the app
 * The list follow the standard from: https://tokenlists.org/
 *
 * Token list must comply with the Schema defined in /src/token.ts
 */
export const tokenLists = {
  COINGECKO: 'https://tokens.coingecko.com/uniswap/all.json',
} as const

export type BundledTokenList = {
  key: string
  list: TokenList
  enabled: boolean
}

/**
 * @dev Bundled (offline) token lists included at build time.
 * Add entries here to ship curated token sets without a network request.
 * Each entry is gated by an `enabled` flag so testnet lists stay out of
 * production builds when PUBLIC_INCLUDE_TESTNETS is false.
 */
export const bundledTokenLists: BundledTokenList[] = [
  {
    key: 'aave-sepolia-faucet',
    list: aaveSepoliaFaucetTokens,
    enabled: includeTestnets,
  },
]
