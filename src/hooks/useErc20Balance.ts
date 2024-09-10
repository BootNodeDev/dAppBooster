import { useQuery } from '@tanstack/react-query'
import { type Address, erc20Abi, getAddress } from 'viem'
import { usePublicClient } from 'wagmi'

import { type Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

export type Erc20Balance = {
  balance?: bigint
  balanceError: Error | null
  isLoadingBalance: boolean
}

/**
 * Custom hook to fetch the ERC20 token balance for a given Token address.
 *
 * @param {Object} params - The params object.
 * @param {Address} params.address - The address for which to fetch the balance.
 * @param {Token} params.token - The ERC20 token object.
 * @returns {Erc20Balance} The ERC20 token balance, error, and loading state.
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
