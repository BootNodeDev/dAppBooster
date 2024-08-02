import { type FC, type HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

import { Link } from '@tanstack/react-router'
import {
  InnerContainer,
  Header as BaseHeader,
  Logo as BaseLogo,
  ContainerPadding,
  SwitchThemeButton,
  breakpointMediaQuery,
} from 'db-ui-toolkit'
import { useTheme } from 'next-themes'

import { ConnectWalletButton } from '@/src/providers/Web3Provider'
import MainMenu from '@/src/sharedComponents/MainMenu'
import MobileMenu from '@/src/sharedComponents/MobileMenu'

/**
 * Note: you can remove all the custom styles and just use the default Header
 * component from db-ui-toolkit (or just create your own)
 */
const Wrapper = styled(BaseHeader)`
  padding-top: var(--base-padding-mobile);
  position: relative;
  z-index: 10;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      height: var(--base-header-height);
      padding-top: 14px;
    `,
  )}
`

const Inner = styled(InnerContainer)`
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
  width: 140px;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      width: auto;
    `,
  )}
`

const Menu = styled(MainMenu)`
  display: none;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      display: flex;
      justify-content: center;
      flex: 1;
    `,
  )}
`

const End = styled.div`
  align-items: center;
  column-gap: calc(var(--base-gap));
  display: none;
  flex: 1;
  height: 100%;
  justify-content: flex-end;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      display: flex;
    `,
  )}
`

export const Header: FC<HTMLAttributes<HTMLElement>> = ({ ...restProps }) => {
  const { setTheme, theme } = useTheme()

  return (
    <Wrapper {...restProps}>
      <Inner>
        <Start>
          <HomeLink to="/">
            <Logo />
          </HomeLink>
        </Start>
        <Menu />
        <End>
          <SwitchThemeButton onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
          <ConnectWalletButton />
        </End>
        <MobileMenu />
      </Inner>
    </Wrapper>
  )
}
