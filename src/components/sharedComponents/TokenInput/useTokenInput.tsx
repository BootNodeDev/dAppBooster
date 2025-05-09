import { useErc20Balance } from '@/src/hooks/useErc20Balance'
import type { Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getAddress } from 'viem'
import { useAccount, usePublicClient } from 'wagmi'

export type UseTokenInputReturnType = ReturnType<typeof useTokenInput>

/**
 * Token Input Hook
 *
 * Manages state and logic for token input components, handling:
 * - Token amount and validation errors
 * - Selected token state
 * - Balance fetching for ERC20 and native tokens
 *
 * @param {Token} [token] - Optional initial token to select
 * @returns {Object} Hook return object
 * @returns {bigint} returns.amount - The current input amount as a bigint
 * @returns {function} returns.setAmount - Function to update the amount
 * @returns {string|null} returns.amountError - Error message for invalid amount
 * @returns {function} returns.setAmountError - Function to update amount errors
 * @returns {bigint} returns.balance - Current token balance (ERC20 or native)
 * @returns {Error|null} returns.balanceError - Error from balance fetching
 * @returns {boolean} returns.isLoadingBalance - Loading state for balance
 * @returns {Token|undefined} returns.selectedToken - Currently selected token
 * @returns {function} returns.setTokenSelected - Function to update selected token
 *
 * @example
 * ```tsx
 * const {
 *   amount,
 *   balance,
 *   selectedToken,
 *   setAmount,
 *   setTokenSelected
 * } = useTokenInput(defaultToken);
 * ```
 */
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
