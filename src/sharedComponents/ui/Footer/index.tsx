'use client'

import { PropsWithChildren } from 'react'
import styled from 'styled-components'

import { ContainerPadding } from '@/src/sharedComponents/ui/ContainerPadding'
import { Logo } from '@/src/sharedComponents/ui/Footer/assets/Logo'
import { InnerContainer } from '@/src/sharedComponents/ui/InnerContainer'

export const Wrapper = styled.footer`
  align-items: center;
  background-color: var(--theme-footer-background-color);
  color: var(--theme-footer-text-color);
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: 92px;
`

const Inner = styled(InnerContainer)`
  align-items: center;
  flex-direction: row;
  height: 100%;
  justify-content: center;

  ${ContainerPadding}
`

export const Footer: React.FC<PropsWithChildren> = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Inner>
        <Logo />
      </Inner>
    </Wrapper>
  )
}
