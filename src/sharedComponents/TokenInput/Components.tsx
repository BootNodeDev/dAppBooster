import styled from 'styled-components'

import { Button, Textfield as BaseTextfield } from 'db-ui-toolkit'

const BaseChevronDown = ({ ...restProps }) => (
  <svg
    fill="none"
    height="8"
    viewBox="0 0 12 8"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      d="M1.5 1.75L6 6.25L10.5 1.75"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

export const Wrapper = styled.div.attrs({ className: 'tokenInput' })`
  background-color: var(--theme-token-input-background, #fff);
  border-radius: var(--base-token-input-border-radius, var(--base-border-radius, 8px));
  max-width: 100%;
  padding: var(--base-token-input-padding, var(--base-common-padding-xl, 16px));
  row-gap: var(--base-token-input-gap, var(--base-gap, 8px));
  display: flex;
  flex-direction: column;
`

export const Title = styled.h3.attrs({ className: 'tokenInputTitle' })`
  color: var(--theme-token-input-title-color, #2e3048);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
`

export const TopRow = styled.div.attrs({ className: 'tokenInputTopRow' })`
  column-gap: var(--base-gap);
  display: flex;
  height: 58px;
`

export const Textfield = styled(BaseTextfield).attrs({
  className: 'tokenInputTextfield',
})`
  /* Texfield */
  --theme-textfield-background-color: var(--theme-token-input-textfield-background-color, #fff);
  --theme-textfield-background-color-active: var(
    --theme-token-input-textfield-background-color-active,
    rgb(0 0 0 / 2%)
  );
  --theme-textfield-border-color: var(--theme-token-input-textfield-border-color, #e2e0e7);
  --theme-textfield-border-color-active: var(
    --theme-token-input-textfield-border-color-active,
    #e2e0e7
  );
  --theme-textfield-color: var(--theme-token-input-textfield-color, #2e3048);
  --theme-textfield-color-active: var(--theme-token-input-textfield-color-active, #2e3048);
  --theme-textfield-placeholder-color: var(
    --theme-token-input-textfield-placeholder-color,
    rgb(22 29 26 / 60%)
  );

  font-size: 3.2rem;
  height: auto;
`

export const ChevronDown = styled(BaseChevronDown)`
  margin-left: var(--base-gap);
`

export const DropdownButton = styled(Button).attrs(({ children }) => {
  return {
    className: 'tokenInputDropdownButton',
    children: (
      <>
        {children}
        <ChevronDown />
      </>
    ),
  }
})`
  /* Dropdown button */
  --theme-button-background-color: var(--theme-token-input-dropdown-button-background-color, #fff);
  --theme-button-background-color-hover: var(
    --theme-token-input-dropdown-button-background-color-hover,
    rgb(0 0 0 / 5%)
  );
  --theme-button-border-color: var(--theme-token-input-dropdown-button-border-color, #e2e0e7);
  --theme-button-border-color-hover: var(
    --theme-token-input-dropdown-button-border-color-hover,
    #e2e0e7
  );
  --theme-button-border-color-active: var(
    --theme-token-input-dropdown-button-border-color-active,
    #e2e0e7
  );
  --theme-button-color: var(--theme-token-input-dropdown-button-color, #2e3048);
  --theme-button-color-hover: var(--theme-token-input-dropdown-button-color-hover, #2e3048);

  font-size: 1.6rem;
  font-weight: 500;
  flex-shrink: 0;
  height: auto;
  min-width: 100px;
`

export const Error = styled.span`
  color: var(--theme-color-danger);
  font-weight: 700;
  font-size: 1.2rem;
  padding: 0;
`

export const BottomRow = styled.div.attrs({ className: 'tokenInputBottomRow' })`
  column-gap: var(--base-gap);
  display: flex;
  justify-content: space-between;
`

export const EstimatedUSDValue = styled.div.attrs({ className: 'tokenInputEstimatedUSDValue' })`
  align-items: center;
  color: var(--theme-token-input-estimated-usd-color, #4b4d60);
  display: flex;
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

export const Balance = styled.div.attrs({ className: 'tokenInputBalance' })`
  align-items: center;
  color: var(--theme-token-input-balance-color, #4b4d60);
  column-gap: var(--base-gap);
  display: flex;
`

export const BalanceValue = styled.span`
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

export const MaxButton = styled(Button).attrs({
  className: 'tokenInputMaxButton',
})`
  /* Max button */
  --theme-button-background-color: var(--theme-token-input-max-button-background-color, #fff);
  --theme-button-background-color-hover: var(
    --theme-token-input-max-button-background-color-hover,
    rgb(0 0 0 / 5%)
  );
  --theme-button-border-color: var(--theme-token-input-max-button-border-color, #e2e0e7);
  --theme-button-border-color-hover: var(
    --theme-token-input-max-button-border-color-hover,
    #e2e0e7
  );
  --theme-button-border-color-active: var(
    --theme-token-input-max-button-border-color-active,
    #e2e0e7
  );
  --theme-button-color: var(--theme-token-input-max-button-color, #8b46a4);
  --theme-button-color-hover: var(--theme-token-input-max-button-color-hover, #8b46a4);

  font-size: 1.2rem;
  font-weight: 400;
  height: 22px;
  padding-left: var(--base-common-padding);
  padding-right: var(--base-common-padding);
`

export const Icon = styled.div.attrs<{ $iconSize?: number }>({ className: 'tokenInputIcon' })`
  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  height: ${({ $iconSize }) => $iconSize}px;
  justify-content: center;
  overflow: hidden;
  width: ${({ $iconSize }) => $iconSize}px;
`
