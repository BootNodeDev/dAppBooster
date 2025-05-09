import { useQuery } from '@tanstack/react-query'
import { type Address, erc20Abi, getAddress } from 'viem'
import { usePublicClient } from 'wagmi'

import type { Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

export type Erc20Balance = {
  balance?: bigint
  balanceError: Error | null
  isLoadingBalance: boolean
}

/**
 * Custom hook to fetch an ERC20 token balance for a specific address.
 *
 * Uses TanStack Query to efficiently fetch and cache token balances.
 * The hook handles proper address formatting and ensures the query
 * only runs when all required parameters are available.
 *
 * @param {Object} params - The params object
 * @param {Address} [params.address] - The wallet address to check the balance for
 * @param {Token} [params.token] - The ERC20 token object containing address and chainId
 *
 * @returns {Erc20Balance} Result object
 * @returns {bigint} [returns.balance] - The token balance as a bigint
 * @returns {Error|null} returns.balanceError - Error from balance fetching, if any
 * @returns {boolean} returns.isLoadingBalance - Loading state indicator
 *
 * @example
 * ```tsx
 * const { balance, balanceError, isLoadingBalance } = useErc20Balance({
 *   address: '0x123...',
 *   token: { address: '0xabc...', chainId: 1, symbol: 'DAI', decimals: 18 }
 * });
 * ```
 */
export const useErc20Balance = ({
  address,
  token,
}: {
  address?: Address
  token?: Token
}): Erc20Balance => {
  const enabled = !!address && !!token && !isNativeToken(token.address)
  const publicClient = usePublicClient({ chainId: token?.chainId })

  const { data, error, isLoading } = useQuery({
    queryKey: ['balanceOf', token?.address, token?.chainId, address],
    queryFn: () =>
      publicClient?.readContract({
        abi: erc20Abi,
        address: getAddress(token?.address ?? ''),
        args: [getAddress(address ?? '')],
        functionName: 'balanceOf',
      }),
    enabled,
  })

  return { balance: data, balanceError: error, isLoadingBalance: isLoading }
}
