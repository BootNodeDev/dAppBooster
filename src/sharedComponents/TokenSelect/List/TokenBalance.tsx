import { formatUnits } from 'viem'

import { Balance, Value } from '@/src/sharedComponents/TokenSelect/List/Row'
import type { Token } from '@/src/types/token'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

/**
 * Renders the token balance in the token list row.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isLoading - Indicates if the token balance is currently being loaded.
 * @param {Token} props.token - The token object containing the amount, decimals, and price in USD.
 * @returns {JSX.Element} The rendered token balance component.
 * @throws {Promise} If the token balance is still loading or if the token does not have balance information.
 *
 * @component
 * @example
 * ```tsx
 * <TokenBalance isLoading={false} token={token} />
 * ```
 */
const TokenBalance = withSuspenseAndRetry(
  ({ isLoading, token }: { isLoading?: boolean; token: Token }) => {
    const tokenHasBalanceInfo = !!token.extensions

    if (isLoading || !tokenHasBalanceInfo) {
      throw Promise.reject()
    }

    const balance = formatUnits(token.extensions!.balance as bigint, token.decimals)
    const value = (parseFloat(token.extensions!.priceUSD as string) * parseFloat(balance)).toFixed(
      2,
    )

    return (
      <>
        <Balance>{balance}</Balance>
        <Value>$ {value}</Value>
      </>
    )
  },
)

export default TokenBalance
