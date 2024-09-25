import type { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

import Item from '@/src/components/sharedComponents/TokenSelect/TopTokens/Item'
import type { Token, Tokens } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

const Wrapper = styled.div.attrs(({ className = 'tokenSelectTopTokensWrapper' }) => {
  return {
    className,
  }
})`
  display: flex;
  flex-wrap: wrap;
  gap: var(--base-gap-xl, 16px);
  padding-left: var(--base-common-padding-xl, 16px);
  padding-right: var(--base-common-padding-xl, 16px);
`

interface TopTokensProps extends HTMLAttributes<HTMLDivElement> {
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
    <Wrapper {...restProps}>
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
    </Wrapper>
  )
}

export default TopTokens
