import { type FC } from 'react'
import styled from 'styled-components'

import { InnerContainer, Footer as BaseFooter, LogoMini, ContainerPadding } from 'db-ui-toolkit'

export const Wrapper = styled(BaseFooter)`
  height: 92px;
  margin-top: calc(var(--base-gap-xl) * 2);
`

const Inner = styled(InnerContainer)`
  justify-content: center;

  ${ContainerPadding}
`

export const Footer: FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Inner>
        <a
          href="https://www.bootnode.dev/"
          rel="noreferrer"
          target="_blank"
          title="Building the future of Web3"
        >
          <LogoMini />
        </a>
      </Inner>
    </Wrapper>
  )
}
