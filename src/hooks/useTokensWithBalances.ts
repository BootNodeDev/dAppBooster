import { createConfig, EVM, getTokenBalances, type Token, getTokens } from '@lifi/sdk'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Address } from 'viem'

import { env } from '@/src/env'
import { useTokens } from '@/src/hooks/useTokens'
import { useWeb3StatusConnected } from '@/src/hooks/useWeb3Status'
import {
  BALANCE_CACHE_EXPIRATION_TIME,
  updateTokenBalanceCache,
} from '@/src/utils/tokensBalanceCache'

export const lifiConfig = createConfig({
  integrator: env.PUBLIC_APP_NAME,
  providers: [EVM()],
})

export const useTokensWithBalances = ({ account }: { account?: Address } = {}) => {
  const { address } = useWeb3StatusConnected()
  const tokensData = useTokens()
  account ??= address

  const { data: tokensPricesByChain } = useSuspenseQuery({
    queryKey: ['lifi', 'tokens', 'prices'],
    queryFn: () =>
      // we can use this to narrow the query to the chains we have tokens for
      // but we must ensure that the chains are supported by lifi's API
      // getTokens({ chains: Object.keys(tokensByChainId).map((id) => parseInt(id)) }),
      getTokens(),
    staleTime: BALANCE_CACHE_EXPIRATION_TIME,
    refetchInterval: BALANCE_CACHE_EXPIRATION_TIME,
    gcTime: Infinity,
  })

  const { data: tokensBalances } = useSuspenseQuery({
    queryKey: ['lifi', 'tokens', 'balances', account],
    queryFn: () => getTokenBalances(account, tokensData.tokens as Token[]),
    staleTime: BALANCE_CACHE_EXPIRATION_TIME,
    refetchInterval: BALANCE_CACHE_EXPIRATION_TIME,
    gcTime: Infinity,
  })

  const cache = updateTokenBalanceCache(account, tokensData.tokens, [
    tokensBalances,
    tokensPricesByChain,
  ])

  return cache
}
