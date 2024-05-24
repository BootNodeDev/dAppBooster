import { PropsWithChildren } from 'react'
import styled from 'styled-components'

import { Link } from '@tanstack/react-router'

import { ContainerPadding } from '@/src/sharedComponents/ui/ContainerPadding'
import { Logo } from '@/src/sharedComponents/ui/Header/assets/Logo'
import { InnerContainer } from '@/src/sharedComponents/ui/InnerContainer'
import { MainMenu } from '@/src/sharedComponents/ui/MainMenu'
import { ConnectWalletButton } from '@/src/sharedComponents/web3/Web3Provider'

export const Wrapper = styled.header`
  background-color: var(--theme-header-background-color);
  color: var(--theme-header-text-color);
  flex-grow: 0;
  flex-shrink: 0;
  height: 48px;
  margin-top: 48px;
  z-index: 10;
`

const HomeLink = styled(Link)`
  &:active {
    opacity: 0.7;
  }
`

const Inner = styled(InnerContainer)`
  align-items: center;
  flex-direction: row;
  height: 100%;
  justify-content: space-between;

  ${ContainerPadding}
`

export const Header: React.FC<PropsWithChildren> = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Inner>
        <HomeLink href="/">
          <Logo />
        </HomeLink>
        <MainMenu />
        <ConnectWalletButton />
      </Inner>
    </Wrapper>
  )
}
