import React, { PropsWithChildren } from 'react'
import styled from 'styled-components'

import { InnerContainer } from '@/src/sharedComponents/ui/InnerContainer'

export const Wrapper = styled.main`
  display: flex;
  flex-grow: 1;
`

const Inner = styled(InnerContainer)`
  min-height: 100%;
`

export const Main: React.FC<PropsWithChildren> = ({ children, ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Inner>{children}</Inner>
    </Wrapper>
  )
}
