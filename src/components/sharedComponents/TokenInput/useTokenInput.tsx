import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { getAddress } from 'viem'
import { useAccount, usePublicClient } from 'wagmi'

import { useErc20Balance } from '@/src/hooks/useErc20Balance'
import { type Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

export type UseTokenInputReturnType = ReturnType<typeof useTokenInput>
export function useTokenInput(token?: Token) {
  const [amount, setAmount] = useState<bigint>(BigInt(0))
  const [amountError, setAmountError] = useState<string | null>()
  const [selectedToken, setTokenSelected] = useState<Token | undefined>(token)

  useEffect(() => {
    setTokenSelected(token)
  }, [token])

  const { address: userWallet } = useAccount()
  const { balance, balanceError, isLoadingBalance } = useErc20Balance({
    address: userWallet ? getAddress(userWallet) : undefined,
    token: selectedToken,
  })

  const publicClient = usePublicClient({ chainId: token?.chainId })

  const isNative = selectedToken?.address ? isNativeToken(selectedToken.address) : false
  const {
    data: nativeBalance,
    error: nativeBalanceError,
    isLoading: isLoadingNativeBalance,
  } = useQuery({
    queryKey: ['nativeBalance', selectedToken?.address, selectedToken?.chainId, userWallet],
    queryFn: () => publicClient?.getBalance({ address: getAddress(userWallet ?? '') }),
    enabled: isNative,
  })

  return {
    amount,
    setAmount,
    amountError,
    setAmountError,
    balance: isNative ? nativeBalance : balance,
    balanceError: isNative ? nativeBalanceError : balanceError,
    isLoadingBalance: isNative ? isLoadingNativeBalance : isLoadingBalance,
    selectedToken,
    setTokenSelected,
  }
}
