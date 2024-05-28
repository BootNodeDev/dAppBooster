import { PropsWithChildren } from 'react'
import styled from 'styled-components'

import { InnerContainer as Inner, Footer as BaseFooter, LogoMini } from 'db-ui-toolkit'

export const Wrapper = styled(BaseFooter)`
  align-items: center;
  display: flex;
  height: 92px;
`

const InnerContainer = styled(Inner)`
  justify-content: center;
`

const Logo = styled(LogoMini)`
  .themedColor {
    [data-theme='light'] & {
      fill: #2e3048;
    }

    [data-theme='dark'] & {
      fill: #fff;
    }
  }
`

export const Footer: React.FC<PropsWithChildren> = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <InnerContainer>
        <Logo />
      </InnerContainer>
    </Wrapper>
  )
}
