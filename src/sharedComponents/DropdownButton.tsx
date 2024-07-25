import styled from 'styled-components'

import { Button } from 'db-ui-toolkit'

const ChevronDown = () => (
  <svg
    className="chevronDown"
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const DropdownButton = styled(Button).attrs(({ children }) => ({
  $variant: 'dropdown',
  children: (
    <>
      {children} <ChevronDown />
    </>
  ),
}))`
  font-size: 1.6rem;
  font-weight: 500;
  height: 48px;
  padding-left: calc(var(--base-common-padding) * 3);
  padding-right: calc(var(--base-common-padding) * 3);

  .chevronDown {
    transition: transform var(--base-transition-duration-xs) ease-in-out;
  }

  .isActive & {
    .chevronDown {
      transform: rotate(180deg);
    }
  }
`

export default DropdownButton
