import { type FC } from 'react'
import styled from 'styled-components'

import TokenLogo from '@/src/sharedComponents/TokenLogo'
import { type Token } from '@/src/types/token'
import { getTruncatedHash } from '@/src/utils/strings'

const TokenInfo = styled.div`
  column-gap: 10px;
  display: flex;
  width: 100vw;
  transition: cubic-bezier(0.075, 0.82, 0.165, 1) 2s;

  &:hover {
    background-color: #fafa;
    cursor: pointer;
  }
`

type TokenRowProps = {
  onClick: (token: Token) => void
  token: Token
}

const TokenRow: FC<TokenRowProps> = ({ onClick, token }) => (
  <TokenInfo onClick={() => onClick(token)}>
    <TokenLogo token={token} />
    {token.symbol} - {getTruncatedHash(token.address)}
  </TokenInfo>
)

export default TokenRow
