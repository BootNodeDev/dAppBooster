import { type HTMLAttributes } from 'react'
import styled from 'styled-components'

import Pill from '@/src/sharedComponents/TokenSelect/TopTokens/Pill'
import { type Tokens, type Token } from '@/src/types/token'

const Wrapper = styled.div`
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
          <Pill key={index} onClick={() => onTokenSelect(token)} token={token} />
        ))}
    </Wrapper>
  )
}

export default TopTokens
