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
  ({ children, className = 'tokenSelectNetworkButton' }) => ({
    children: (
      <>
        {children} <ChevronDown />
      </>
    ),
    type: 'button',
    className,
  }),
)`
  --theme-token-select-network-button-color-default: var(
    --theme-token-select-network-button-color,
    #2e3048
  );
  --theme-token-select-network-button-background-color-default: var(
    --theme-token-select-network-button-background-color,
    #f7f7f7
  );

  align-items: center;
  background-color: var(--theme-token-select-network-button-background-color-default);
  border-radius: var(--base-border-radius);
  border: none;
  color: var(--theme-token-select-network-button-color-default);
  column-gap: var(--base-gap);
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 0;
  width: 88px;

  &:hover {
    background-color: var(
      --theme-token-select-network-button-background-color-hover,
      var(--theme-token-select-network-button-background-color-default)
    );
    color: var(
      --theme-token-select-network-button-color-hover,
      var(--theme-token-select-network-button-color-default)
    );
  }

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
