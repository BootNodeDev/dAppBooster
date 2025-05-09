import Item from '@/src/components/sharedComponents/TokenSelect/TopTokens/Item'
import type { Token, Tokens } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'
import { Flex, type FlexProps } from '@chakra-ui/react'
import type { FC } from 'react'

interface TopTokensProps extends FlexProps {
  onTokenSelect: (token: Token | undefined) => void
  tokens: Tokens
}

/**
 * TopTokens component for TokenSelect. Displays a list of top / preferred tokens.
 *
 * @param {function} onTokenSelect - Callback function to be called when a token is selected.
 * @param {Tokens} tokens - The list of tokens to display.
 */
const TopTokens: FC<TopTokensProps> = ({ onTokenSelect, tokens, ...restProps }) => {
  const topTokenSymbols = ['op', 'usdc', 'usdt', 'dai', 'weth', 'wbtc', 'aave']

  return (
    <Flex
      display="flex"
      flexWrap="wrap"
      gap={4}
      paddingX={4}
      {...restProps}
    >
      {[
        // append native token at the beginning
        tokens.find((token) => isNativeToken(token.address)),
        ...tokens
          .filter((token) => topTokenSymbols.includes(token.symbol.toLowerCase()))
          .sort(
            (a, b) =>
              topTokenSymbols.indexOf(a.symbol.toLowerCase()) -
              topTokenSymbols.indexOf(b.symbol.toLowerCase()),
          ),
      ]
        // if token is not found, filter it out
        .filter(Boolean)
        // render the token
        .map((token) => (
          <Item
            key={`token_${token?.address}`}
            onClick={() => onTokenSelect(token)}
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            token={token!}
          />
        ))}
    </Flex>
  )
}

export default TopTokens
