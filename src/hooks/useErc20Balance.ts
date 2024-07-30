import { type Address, erc20Abi, getAddress, ReadContractErrorType } from 'viem'
import { useReadContract } from 'wagmi'

import { type Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

export type Erc20Balance = {
  balance?: bigint
  balanceError: ReadContractErrorType | null
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
  const enabled = !!address && !!token && isNativeToken(token.address)

  const { data, error, isLoading } = useReadContract({
    abi: erc20Abi,
    address: enabled ? getAddress(token.address) : undefined,
    args: enabled ? [address] : undefined,
    chainId: enabled ? token.chainId : undefined,
    functionName: 'balanceOf',
    query: {
      enabled,
    },
  })

  return { balance: data, balanceError: error, isLoadingBalance: isLoading }
}
