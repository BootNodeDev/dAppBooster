import { type ButtonHTMLAttributes, type FC } from 'react'
import styled from 'styled-components'

import TokenLogo from '@/src/components/sharedComponents/TokenLogo'
import { type Token } from '@/src/types/token'

const ICON_SIZE = 24

const SymbolComponent = styled.div.attrs(({ className = 'tokenSelectTopTokenItemSymbol' }) => {
  return {
    className,
  }
})`
  color: var(--theme-token-select-top-token-item-color, #2e3048);
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.2;
`

const Wrapper = styled.button.attrs(({ className = 'tokenSelectTopTokenItem', tabIndex = 0 }) => {
  return {
    className,
    tabIndex,
  }
})`
  align-items: center;
  background-color: var(--theme-token-select-top-token-item-background-color, #fff);
  border-radius: var(--base-border-radius, 8px);
  border: 1px solid var(--theme-token-select-top-token-item-border-color, #e2e0e7);
  column-gap: var(--base-gap, 8px);
  cursor: pointer;
  display: grid;
  grid-template-columns: ${ICON_SIZE}px 1fr;
  height: 41px;
  padding: 0 var(--base-common-padding-xl, 16px);
  transition: background-color var(--base-transition-duration-sm, 0.2s) ease-in-out;

  &:hover {
    background-color: var(
      --theme-token-select-top-token-item-background-color-hover,
      rgb(0 0 0 / 5%)
    );
    border-color: var(
      --theme-token-select-top-token-item-border-color-hover,
      var(--theme-token-select-top-token-item-border-color, #e2e0e7)
    );

    ${SymbolComponent} {
      color: var(
        --theme-token-select-top-token-item-color-hover,
        var(--theme-token-select-top-token-item-color, #2e3048)
      );
    }
  }

  &:active {
    opacity: 0.8;
  }
`

const Icon = styled.div.attrs(({ className = 'tokenSelectTopTokenItemIcon' }) => {
  return { className }
})`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${ICON_SIZE}px;
  justify-content: center;
  overflow: hidden;
  width: ${ICON_SIZE}px;
`

interface ItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  token: Token
}

/**
 * A single token item in the top tokens list
 *
 * @param {Token} token - The token to display
 */
const Item: FC<ItemProps> = ({ token, ...restProps }) => {
  const { symbol } = token

  return (
    <Wrapper {...restProps}>
      <Icon>
        <TokenLogo size={ICON_SIZE} token={token} />
      </Icon>
      <SymbolComponent>{symbol}</SymbolComponent>
    </Wrapper>
  )
}

export default Item
