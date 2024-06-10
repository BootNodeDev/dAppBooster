import styled from 'styled-components'

import { Link } from '@tanstack/react-router'

const Wrapper = styled.nav`
  align-items: center;
  display: flex;
  column-gap: calc(var(--base-gap) * 5);
  height: 100%;
`

const Item = styled(Link)`
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

export const MainMenu = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Item to="/">Home</Item>
      <Item to="/tokens">Tokens</Item>
      <Item to="/about">About</Item>
      <Item to="/contact">Contact</Item>
    </Wrapper>
  )
}
