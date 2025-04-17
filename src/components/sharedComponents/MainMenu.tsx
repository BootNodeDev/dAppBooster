import { menuItems } from '@/src/constants/menuItems'
import { breakpointMediaQuery } from '@bootnodedev/db-ui-toolkit'
import { Link } from '@tanstack/react-router'
import styled, { css } from 'styled-components'

const Wrapper = styled.nav`
  align-items: center;
  column-gap: calc(var(--base-gap) * 5);
  display: none;
  height: 100%;


   ${breakpointMediaQuery(
     'desktopStart',
     css`
       display: flex;
       justify-content: center;
       flex: 1;
     `,
   )}
`

const LinkCSS = css`
  color: var(--theme-main-menu-item-color);
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.2;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:active {
    opacity: 0.7;
  }
`

const Item = styled(Link)`
  ${LinkCSS}
`

const ExternalItem = styled.a`
  ${LinkCSS}
`

const MainMenu = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      {menuItems.map(({ href, label, to }, index) => {
        const key = `menuItem_${index}`

        return to ? (
          <Item
            key={key}
            to={to}
          >
            {label}
          </Item>
        ) : href ? (
          <ExternalItem
            href={href}
            key={key}
            rel="noopener noreferrer"
            target="_blank"
          >
            {label}
          </ExternalItem>
        ) : null
      })}
    </Wrapper>
  )
}

export default MainMenu
