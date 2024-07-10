import { type FC, type HTMLAttributes } from 'react'
import styled from 'styled-components'

import { env } from '@/src/env'
import Item from '@/src/sharedComponents/TokenSelect/TopTokens/Item'
import { type Tokens, type Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

const Wrapper = styled.div.attrs(({ className = 'tokenSelectTopTokensWrapper' }) => ({
  className,
}))`
  display: flex;
  flex-wrap: wrap;
  gap: var(--base-gap-xl);
  padding-left: var(--base-token-select-horizontal-padding);
  padding-right: var(--base-token-select-horizontal-padding);
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  onTokenSelect: (token: Token | undefined) => void
  tokens: Tokens
}

/**
 * @name TopTokens
 * @description TopTokens component for TokenSelect. Displays a list of top / preferred tokens.
 *
 * @param {function} onTokenSelect - Callback function to be called when a token is selected.
 * @param {Tokens} tokens - The list of tokens to display.
 */
const TopTokens: FC<Props> = ({ onTokenSelect, tokens, ...restProps }: Props) => {
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
        .map((token, index) => (
          <Item key={index} onClick={() => onTokenSelect(token)} token={token!} />
        ))}
    </Wrapper>
  )
}

export default TopTokens
