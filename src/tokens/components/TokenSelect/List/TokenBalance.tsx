import { Box, Flex } from '@chakra-ui/react'
import { formatUnits } from 'viem'
import { withSuspenseAndRetry } from '@/src/core/utils'
import type { Token } from '../../../types'

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
    Number.parseFloat((token.extensions?.priceUSD ?? '0') as string) * Number.parseFloat(balance)
  ).toFixed(2)

  return (
    <Flex
      alignItems="flex-end"
      display="flex"
      flexDirection="column"
      rowGap={1}
    >
      <Box
        color="var(--row-token-balance-color)"
        fontSize="16px"
        fontWeight="400"
        lineHeight="1.2"
        _groupHover={{
          color: 'var(--row-token-balance-color-hover, var(--row-token-balance-color)',
        }}
      >
        {balance}
      </Box>
      <Box
        color="var(--row-token-value-color)"
        fontSize="12px"
        fontWeight="400"
        lineHeight="1.2"
        _groupHover={{
          color: 'var(--row-token-value-color-hover, var(--row-token-value-color)',
        }}
      >
        $ {value}
      </Box>
    </Flex>
  )
})

export default TokenBalance
