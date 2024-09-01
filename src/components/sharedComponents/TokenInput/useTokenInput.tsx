import { useEffect, useState } from 'react'

import { getAddress } from 'viem'
import { useAccount, useBalance } from 'wagmi'

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

  const isNative = selectedToken?.address ? isNativeToken(selectedToken.address) : false
  const {
    data: nativeBalance,
    error: nativeBalanceError,
    isLoading: isLoadingNativeBalance,
  } = useBalance({
    address: userWallet ? getAddress(userWallet) : undefined,
    chainId: selectedToken?.chainId,
    query: {
      enabled: isNative,
    },
  })

  return {
    amount,
    setAmount,
    amountError,
    setAmountError,
    balance: isNative ? nativeBalance?.value : balance,
    balanceError: isNative ? nativeBalanceError : balanceError,
    isLoadingBalance: isNative ? isLoadingNativeBalance : isLoadingBalance,
    selectedToken,
    setTokenSelected,
  }
}
