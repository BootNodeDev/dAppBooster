import { Box, Flex, Skeleton } from '@chakra-ui/react'
import { formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import { useErc20Balance } from '@/src/hooks/useErc20Balance'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import type { Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

interface TokenBalanceProps {
  isLoading?: boolean
  token: Token
}

const balanceBoxProps = {
  color: 'var(--row-token-balance-color)',
  fontSize: '16px',
  fontWeight: '400',
  lineHeight: '1.2',
  _groupHover: { color: 'var(--row-token-balance-color-hover, var(--row-token-balance-color)' },
} as const

const valueBoxProps = {
  color: 'var(--row-token-value-color)',
  fontSize: '12px',
  fontWeight: '400',
  lineHeight: '1.2',
  _groupHover: { color: 'var(--row-token-value-color-hover, var(--row-token-value-color)' },
} as const

const flexProps = {
  alignItems: 'flex-end',
  display: 'flex',
  flexDirection: 'column',
  rowGap: 1,
} as const

/**
 * Renders the token balance and USD value in a token list row.
 *
 * When LI.FI price/balance data is available (`token.extensions`), it displays
 * the enriched balance and computed USD value. On chains LI.FI does not support
 * (e.g. Sepolia), it falls back to on-chain balance via wagmi and renders "N/A"
 * for the USD value.
 *
 * @param {object} props
 * @param {boolean} props.isLoading - True while the LI.FI price/balance fetch is in flight.
 * @param {Token} props.token - The token to display.
 *
 * @throws {Promise} While loading (triggers Suspense skeleton).
 */
const TokenBalance = withSuspenseAndRetry<TokenBalanceProps>(({ isLoading, token }) => {
  const { address } = useWeb3Status()
  const isNative = isNativeToken(token.address)
  const hasExtensions = !!token.extensions

  // Both hooks are called unconditionally; `enabled` flags prevent unnecessary fetches.
  const { data: nativeBalanceData, isLoading: isLoadingNative } = useBalance({
    address,
    chainId: token.chainId,
    query: { enabled: !!address && isNative && !hasExtensions },
  })

  const { balance: erc20Balance, isLoadingBalance: isLoadingErc20 } = useErc20Balance({
    address: !isNative && !hasExtensions ? address : undefined,
    token: !isNative && !hasExtensions ? token : undefined,
  })

  if (isLoading) {
    throw Promise.reject()
  }

  if (hasExtensions) {
    const balance = formatUnits((token.extensions?.balance ?? 0n) as bigint, token.decimals)
    const value = (
      Number.parseFloat((token.extensions?.priceUSD ?? '0') as string) * Number.parseFloat(balance)
    ).toFixed(2)

    return (
      <Flex {...flexProps}>
        <Box {...balanceBoxProps}>{balance}</Box>
        <Box {...valueBoxProps}>$ {value}</Box>
      </Flex>
    )
  }

  // No LI.FI data — skeleton for balance while on-chain fetch is in flight, N/A immediately for value.
  const isLoadingFallback = isNative ? isLoadingNative : isLoadingErc20
  const fallbackBalance = isNative
    ? formatUnits(nativeBalanceData?.value ?? 0n, token.decimals)
    : formatUnits(erc20Balance ?? 0n, token.decimals)

  return (
    <Flex {...flexProps}>
      {isLoadingFallback ? (
        <Skeleton
          height="19px"
          width="50px"
        />
      ) : (
        <Box {...balanceBoxProps}>{fallbackBalance}</Box>
      )}
      <Box {...valueBoxProps}>N/A</Box>
    </Flex>
  )
})

export default TokenBalance
