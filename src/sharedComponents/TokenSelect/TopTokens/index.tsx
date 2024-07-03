import { type HTMLAttributes } from 'react'
import styled from 'styled-components'

import Item from '@/src/sharedComponents/TokenSelect/TopTokens/Item'
import { type Tokens, type Token } from '@/src/types/token'

const Wrapper = styled.div.attrs(({ className = 'tokenSelectTopTokensWrapper' }) => ({
  className,
}))`
  display: flex;
  flex-wrap: wrap;
  gap: var(--base-gap-xl);
  padding-left: var(--base-common-padding-xl);
  padding-right: var(--base-common-padding-xl);
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
const TopTokens: React.FC<Props> = ({ onTokenSelect, tokens, ...restProps }: Props) => {
  const topTokenSymbols = ['matic', 'usdc', 'usdt', 'dai', 'weth', 'wbtc', 'arb', 'aave']

  return (
    <Wrapper {...restProps}>
      {tokens
        .filter((token) => topTokenSymbols.includes(token.symbol.toLowerCase()))
        .sort(
          (a, b) =>
            topTokenSymbols.indexOf(a.symbol.toLowerCase()) -
            topTokenSymbols.indexOf(b.symbol.toLowerCase()),
        )
        .map((token, index) => (
          <Item key={index} onClick={() => onTokenSelect(token)} token={token} />
        ))}
    </Wrapper>
  )
}

export default TopTokens
