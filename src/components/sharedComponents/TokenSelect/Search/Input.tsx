import { type FC, type InputHTMLAttributes, type ComponentPropsWithRef } from 'react'
import styled from 'styled-components'

import { Textfield, TextfieldCSS } from '@bootnodedev/db-ui-toolkit'

const SearchIcon = () => (
  <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M21 21L16.65 16.65"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const Wrapper = styled.div.attrs<ComponentPropsWithRef<'input'>>(
  ({ className = 'tokenSelectInputWrapper' }) => {
    return { className }
  },
)`
  --base-textfield-border-radius: var(--base-border-radius, 8px);
  --base-textfield-padding: 0 var(--base-common-padding-xl, 16px);

  --theme-textfield-color: var(--theme-token-select-search-field-color, #2e3048);
  --theme-textfield-color-active: var(--theme-token-select-search-field-color-active, #2e3048);
  --theme-textfield-background-color: var(
    --theme-token-select-search-field-background-color,
    #f7f7f7
  );
  --theme-textfield-background-color-active: var(
    --theme-token-select-search-field-background-color-active,
    #f7f7f7
  );
  --theme-textfield-placeholder-color: var(
    --theme-token-select-search-field-placeholder-color,
    #161d1a
  );
  --theme-textfield-box-shadow: var(--theme-token-select-search-field-box-shadow, none);
  --theme-textfield-box-shadow-active: var(
    --theme-token-select-search-field-box-shadow-active,
    none
  );
  --theme-textfield-border-color: var(--theme-token-select-search-field-border-color, #e2e0e7);
  --theme-textfield-border-color-active: var(
    --theme-token-select-search-field-border-color-active,
    #e2e0e7
  );

  ${TextfieldCSS}

  align-items: center;
  column-gap: var(--base-gap-xl, 16px);
  display: flex;
  flex-grow: 1;
  height: auto;

  &:focus-within {
    box-shadow: var(--theme-textfield-box-shadow-active);
    border-color: var(--theme-textfield-border-color-active);
  }
`

const SearchInput = styled(Textfield).attrs(() => {
  return { type: 'search' }
})`
  font-size: 1.6rem;

  &,
  &:focus,
  &:hover,
  &:active {
    background: none;
    border: none;
    box-shadow: none;
    padding: 0;
    width: 100%;
  }
`

/**
 * A search input with a search icon
 */
const Input: FC<InputHTMLAttributes<HTMLInputElement>> = ({ className, ...inputProps }) => {
  return (
    <Wrapper className={`${className ? className : ''}`.trim()}>
      <SearchIcon />
      <SearchInput {...inputProps} />
    </Wrapper>
  )
}

export default Input
