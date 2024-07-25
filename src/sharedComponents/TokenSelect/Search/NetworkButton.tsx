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

/**
 * @name NetworkButton
 * @description A button to select a network from a dropdown
 */
const NetworkButton = styled.button.attrs(
  ({ children, className = 'tokenSelectNetworkButton' }) => {
    return {
      children: (
        <>
          {children} <ChevronDown />
        </>
      ),
      type: 'button',
      className,
    }
  },
)`
  align-items: center;
  background-color: var(--theme-token-select-network-button-background-color, #f7f7f7);
  border-radius: var(--base-border-radius);
  border: none;
  color: var(--theme-token-select-network-button-color, #2e3048);
  column-gap: var(--base-gap);
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0;
  width: 88px;

  &:hover {
    background-color: var(
      --theme-token-select-network-button-background-color-hover,
      var(--theme-token-select-network-button-background-color, #f7f7f7)
    );
    color: var(
      --theme-token-select-network-button-color-hover,
      var(--theme-token-select-network-button-color, #2e3048)
    );
  }

  &:active {
    opacity: 0.7;
  }

  .chevronDown {
    transition: transform var(--base-transition-duration-xs) ease-in-out;
  }

  .isActive & {
    .chevronDown {
      transform: rotate(180deg);
    }
  }
`

export default NetworkButton
