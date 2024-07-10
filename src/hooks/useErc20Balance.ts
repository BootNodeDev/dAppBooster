import { Address, erc20Abi, getAddress } from 'viem'
import { useReadContract } from 'wagmi'

import { env } from '@/src/env'
import { type Token } from '@/src/types/token'

export type Erc20Balance = {
  address?: Address
  token?: Token
}

export const useErc20Balance = ({ address, token }: Erc20Balance) => {
  const enabled = !!address && !!token && token.address !== env.PUBLIC_NATIVE_TOKEN_ADDRESS

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
