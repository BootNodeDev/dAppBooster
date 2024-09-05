import styled from 'styled-components'

import { formatUnits } from 'viem'

import { type Token } from '@/src/types/token'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

/** @ignore */
export const Balance = styled.div.attrs(({ className = 'tokenSelectRowBalance' }) => {
  return {
    className,
  }
})`
  color: var(--theme-token-select-row-token-balance-color, #2e3048);
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.2;
`

/** @ignore */
export const Value = styled.div.attrs(({ className = 'tokenSelectRowValue' }) => {
  return { className }
})`
  color: var(--theme-token-select-row-token-value-color, #2e3048);
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

const Values = styled.div.attrs(({ className = 'tokenSelectRowValues' }) => {
  return { className }
})`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  row-gap: var(--base-gap-sm, 4px);
`

interface TokenBalanceProps {
  isLoading?: boolean
  token: Token
}

/**
 * Renders the token balance in the token list row.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isLoading - Indicates if the token balance is currently being loaded.
 * @param {Token} props.token - The token object containing the amount, decimals, and price in USD.
 *
 * @throws {Promise} If the token balance is still loading or if the token does not have balance information.
 * @returns {JSX.Element} The rendered token balance component.
 *
 * @example
 * ```tsx
 * <TokenBalance isLoading={false} token={token} />
 * ```
 */
const TokenBalance = withSuspenseAndRetry<TokenBalanceProps>(({ isLoading, token }) => {
  const tokenHasBalanceInfo = !!token.extensions

  if (isLoading || !tokenHasBalanceInfo) {
    throw Promise.reject()
  }

  const balance = formatUnits((token.extensions?.balance ?? 0n) as bigint, token.decimals)
  const value = (
    parseFloat((token.extensions?.priceUSD ?? '0') as string) * parseFloat(balance)
  ).toFixed(2)

  return (
    <Values>
      <Balance>{balance}</Balance>
      <Value>$ {value}</Value>
    </Values>
  )
})

export default TokenBalance
