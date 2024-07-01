import { type FC, InputHTMLAttributes } from 'react'
import styled from 'styled-components'

import { Textfield, TextfieldCSS } from 'db-ui-toolkit'

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

const Wrapper = styled.div`
  --base-textfield-height: 72px;
  --base-textfield-border-radius: var(--base-border-radius);
  --base-textfield-font-size: 1.6rem;
  --base-textfield-vertical-padding: 0;
  --base-textfield-horizontal-padding: var(--base-common-padding-xl);

  [data-theme='light'] & {
    --theme-textfield-color: #2e3048;
    --theme-textfield-color-active: #2e3048;
    --theme-textfield-color-error: #2e3048;
    --theme-textfield-color-ok: #2e3048;
    --theme-textfield-background-color: #f7f7f7;
    --theme-textfield-background-color-active: #f7f7f7;
    --theme-textfield-placeholder-color: #161d1a;
    --theme-textfield-boxshadow-active: none;
    --theme-textfield-border-color: #e2e0e7;
    --theme-textfield-border-color-active: #e2e0e7;
    --theme-textfield-border-color-error: #e2e0e7;
    --theme-textfield-border-color-ok: #e2e0e7;
  }

  [data-theme='dark'] & {
    --theme-textfield-color: #fff;
    --theme-textfield-color-active: #fff;
    --theme-textfield-color-error: #fff;
    --theme-textfield-color-ok: #fff;
    --theme-textfield-background-color: #292b43;
    --theme-textfield-background-color-active: #292b43;
    --theme-textfield-placeholder-color: #ddd;
    --theme-textfield-boxshadow-active: none;
    --theme-textfield-border-color: #5f6178;
    --theme-textfield-border-color-active: #5f6178;
    --theme-textfield-border-color-error: #5f6178;
    --theme-textfield-border-color-ok: #5f6178;
  }

  ${TextfieldCSS}

  align-items: center;
  column-gap: var(--base-gap-xl);
  display: flex;
`

const Input = styled(Textfield).attrs({ type: 'text' })`
  background: none;
  border: none;
  padding: 0;
  width: 100%;
`

const SearchInput: FC<InputHTMLAttributes<HTMLInputElement>> = ({ className, ...inputProps }) => {
  return (
    <Wrapper className={`${className ? className : ''}`.trim()}>
      <SearchIcon />
      <Input {...inputProps} />
    </Wrapper>
  )
}

export default SearchInput
