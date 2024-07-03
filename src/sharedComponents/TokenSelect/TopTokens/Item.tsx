import { type ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import TokenLogo from '@/src/sharedComponents/TokenLogo'
import { type Token } from '@/src/types/token'

const ICON_SIZE = 24

const Wrapper = styled.button.attrs(({ className = 'tokenSelectTopTokenItem', tabIndex = 0 }) => ({
  className,
  tabIndex,
}))`
  --theme-token-select-top-token-item-border-color-default: var(
    --theme-token-select-top-token-item-border-color,
    #e2e0e7
  );
  --theme-token-select-top-token-item-color-default: var(
    --theme-token-select-top-token-item-color,
    #2e3048
  );
  --theme-token-select-top-token-item-background-color-default: var(
    --theme-token-select-top-token-item-background-color,
    transparent
  );
  --theme-token-select-top-token-item-background-color-hover-default: var(
    --theme-token-select-top-token-item-background-color-hover,
    rgb(0 0 0 / 5%)
  );

  align-items: center;
  background-color: var(--theme-token-select-top-token-item-background-color-default);
  border-radius: var(--base-border-radius);
  border: 1px solid var(--theme-token-select-top-token-item-border-color-default);
  column-gap: var(--base-gap);
  cursor: pointer;
  display: grid;
  grid-template-columns: ${ICON_SIZE}px 1fr;
  height: 41px;
  padding: 0 var(--base-common-padding-xl);
  transition: background-color var(--base-animation-time-sm) ease-in-out;

  &:hover {
    background-color: var(--theme-token-select-top-token-item-background-color-hover-default);
  }
`

const Icon = styled.div.attrs(({ className = 'tokenSelectTopTokenItemIcon' }) => ({ className }))`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${ICON_SIZE}px;
  justify-content: center;
  overflow: hidden;
  width: ${ICON_SIZE}px;
`

const Symbol = styled.div.attrs(({ className = 'tokenSelectTopTokenItemSymbol' }) => ({
  className,
}))`
  color: var(--theme-token-select-top-token-item-color-default);
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.2;
`

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  token: Token
}

const Item: React.FC<Props> = ({ token, ...restProps }: Props) => {
  const { symbol } = token

  return (
    <Wrapper {...restProps}>
      <Icon>
        <TokenLogo size={ICON_SIZE} token={token} />
      </Icon>
      <Symbol>{symbol}</Symbol>
    </Wrapper>
  )
}

export default Item
