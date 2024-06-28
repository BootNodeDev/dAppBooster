import { Address, erc20Abi, getAddress } from 'viem'
import { useReadContract } from 'wagmi'

import { type Token } from '@/src/token'

export type Erc20Balance = {
  address?: Address
  token: Token
}

export const useErc20Balance = ({ address, token }: Erc20Balance) => {
  const { data, error, isLoading } = useReadContract({
    abi: erc20Abi,
    address: getAddress(token.address),
    args: [address!],
    chainId: token.chainId,
    functionName: 'balanceOf',
    query: {
      enabled: !!address,
    },
  })

  return { balance: data, balanceError: error, isLoadingBalance: isLoading }
}
