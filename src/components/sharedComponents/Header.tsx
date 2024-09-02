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

const Wrapper = styled(BaseHeader)`
  margin-bottom: calc(var(--base-gap-xl) * 2);
  padding-top: var(--base-common-padding-xl);
  position: relative;
  z-index: 10;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      height: var(--base-header-height);
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
  display: none;

  &:active {
    opacity: 0.7;
  }

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      display: flex;
    `,
  )}
`

const Logo = styled(BaseLogo)`
  min-width: 140px;
`

const End = styled.div`
  align-items: center;
  column-gap: calc(var(--base-gap));
  display: flex;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
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
        <End>
          <SwitchThemeButton onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
          <ConnectWalletButton />
        </End>
      </Inner>
    </Wrapper>
  )
}
