import { PropsWithChildren } from 'react'
import styled from 'styled-components'

import { InnerContainer, Footer as BaseFooter, LogoMini, ContainerPadding } from 'db-ui-toolkit'

export const Wrapper = styled(BaseFooter)`
  height: 92px;
`

const Inner = styled(InnerContainer)`
  justify-content: center;

  ${ContainerPadding}
`

export const Footer: React.FC<PropsWithChildren> = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Inner>
        <LogoMini />
      </Inner>
    </Wrapper>
  )
}
