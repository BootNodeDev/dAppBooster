import styled from 'styled-components'

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

const NetworkButton = styled.button.attrs(({ children }) => ({
  children: (
    <>
      {children} <ChevronDown />
    </>
  ),
  type: 'button',
}))`
  --base-network-button-height: var(--base-search-wrapper-height);

  [data-theme='light'] & {
    --theme-network-button-color: #2e3048;
    --theme-nerwork-button-background-color: #f7f7f7;
  }

  [data-theme='dark'] & {
    --theme-network-button-color: #fff;
    --theme-nerwork-button-background-color: #292b43;
  }

  align-items: center;
  background-color: var(--theme-nerwork-button-background-color);
  border-radius: var(--base-border-radius);
  border: none;
  color: var(--theme-network-button-color);
  column-gap: var(--base-gap);
  cursor: pointer;
  display: flex;
  height: var(--base-network-button-height);
  justify-content: center;
  padding: 0;
  width: 88px;

  &:active {
    opacity: 0.7;
  }

  .chevronDown {
    transition: transform var(--base-animation-time-xs) ease-in-out;
  }

  .isActive & {
    .chevronDown {
      transform: rotate(180deg);
    }
  }
`

export default NetworkButton
