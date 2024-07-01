import { type FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

import TokenLogo from '@/src/sharedComponents/TokenLogo'
import { type Token } from '@/src/types/token'
import { getTruncatedHash } from '@/src/utils/strings'

const Wrapper = styled.div`
  align-items: center;
  column-gap: var(--base-gap);
  display: flex;
`

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  onClick: (token: Token) => void
  token: Token
}

const Row: FC<Props> = ({ onClick, token, ...restProps }) => (
  <Wrapper onClick={() => onClick(token)} {...restProps}>
    <TokenLogo token={token} />
    {token.symbol} - {getTruncatedHash(token.address)}
  </Wrapper>
)

export default Row
