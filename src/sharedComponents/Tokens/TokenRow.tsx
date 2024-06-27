import { type FC } from 'react'
import styled from 'styled-components'

import TokenLogo from '@/src/sharedComponents/TokenLogo'
import { type Token } from '@/src/token'
import { getTruncatedHash } from '@/src/utils/strings'

const TokenInfo = styled.div`
  column-gap: 10px;
  display: flex;
  width: 100vw;
`

type TokenRowProps = {
  token: Token
}

const TokenRow: FC<TokenRowProps> = ({ token }) => (
  <TokenInfo>
    <TokenLogo token={token} />
    {token.symbol} - {getTruncatedHash(token.address)}
  </TokenInfo>
)

export default TokenRow
