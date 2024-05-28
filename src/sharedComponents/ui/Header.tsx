import { PropsWithChildren } from 'react'
import styled from 'styled-components'

import { Link } from '@tanstack/react-router'
import { InnerContainer as Inner, Header as BaseHeader, Logo as BaseLogo } from 'db-ui-toolkit'

import { ContainerPadding } from '@/src/sharedComponents/ui/ContainerPadding'
import { MainMenu } from '@/src/sharedComponents/ui/MainMenu'
import { SwitchThemeButton } from '@/src/sharedComponents/ui/SwitchThemeButton'
import { ConnectWalletButton } from '@/src/sharedComponents/web3/Web3Provider'

const Wrapper = styled(BaseHeader)`
  height: 48px;
  margin-top: 48px;
`

const InnerContainer = styled(Inner)`
  align-items: center;
  height: 100%;
  justify-content: space-between;

  ${ContainerPadding}
`

const Start = styled.div`
  flex: 1;
`

const HomeLink = styled(Link)`
  &:active {
    opacity: 0.7;
  }
`

const Logo = styled(BaseLogo)`
  .themedColor {
    [data-theme='light'] & {
      fill: #2e3048;
    }

    [data-theme='dark'] & {
      fill: #fff;
    }
  }
`

const Menu = styled(MainMenu)`
  display: flex;
  justify-content: center;
  flex: 1;
`

const End = styled.div`
  align-items: center;
  column-gap: calc(var(--base-gap) * 3);
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
`

export const Header: React.FC<PropsWithChildren> = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <InnerContainer>
        <Start>
          <HomeLink href="/">
            <Logo />
          </HomeLink>
        </Start>
        <Menu />
        <End>
          <SwitchThemeButton />
          <ConnectWalletButton />
        </End>
      </InnerContainer>
    </Wrapper>
  )
}
