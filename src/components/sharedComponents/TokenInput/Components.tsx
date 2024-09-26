import styled, { css } from 'styled-components'

import {
  Textfield as BaseTextfield,
  Button,
  breakpointMediaQuery,
} from '@bootnodedev/db-ui-toolkit'

const BaseChevronDown = ({ ...restProps }) => (
  <svg
    fill="none"
    height="8"
    viewBox="0 0 12 8"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>Chevron down</title>
    <path
      d="M1.5 1.75L6 6.25L10.5 1.75"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const CloseIcon = ({ ...restProps }) => (
  <svg
    fill="none"
    height="21"
    viewBox="0 0 21 21"
    width="21"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>Close</title>
    <path
      d="M20.3111 18.4444C20.404 18.5373 20.4777 18.6476 20.528 18.769C20.5783 18.8904 20.6041 19.0205 20.6041 19.1519C20.6041 19.2833 20.5783 19.4134 20.528 19.5348C20.4777 19.6562 20.404 19.7665 20.3111 19.8594C20.2182 19.9523 20.1079 20.026 19.9865 20.0763C19.8651 20.1266 19.735 20.1525 19.6036 20.1525C19.4722 20.1525 19.3421 20.1266 19.2207 20.0763C19.0993 20.026 18.989 19.9523 18.8961 19.8594L10.6036 11.5657L2.31108 19.8594C2.12344 20.0471 1.86895 20.1525 1.60358 20.1525C1.33822 20.1525 1.08372 20.0471 0.896083 19.8594C0.708443 19.6718 0.603027 19.4173 0.603027 19.1519C0.603027 18.8866 0.708443 18.6321 0.896083 18.4444L9.18983 10.1519L0.896083 1.85942C0.708443 1.67178 0.603027 1.41729 0.603027 1.15192C0.603027 0.886559 0.708443 0.632064 0.896083 0.444423C1.08372 0.256783 1.33822 0.151367 1.60358 0.151367C1.86895 0.151367 2.12344 0.256783 2.31108 0.444423L10.6036 8.73817L18.8961 0.444423C19.0837 0.256783 19.3382 0.151367 19.6036 0.151367C19.8689 0.151367 20.1234 0.256783 20.3111 0.444423C20.4987 0.632064 20.6041 0.886559 20.6041 1.15192C20.6041 1.41729 20.4987 1.67178 20.3111 1.85942L12.0173 10.1519L20.3111 18.4444Z"
      fill="currentColor"
    />
  </svg>
)

export const Wrapper = styled.div.attrs({ className: 'tokenInput' })`
  background-color: var(--theme-token-input-background, #fff);
  border-radius: var(
    --base-token-input-border-radius,
    var(--base-border-radius, 8px)
  );
  display: flex;
  flex-direction: column;
  max-width: 100%;
  padding: var(--base-token-input-padding, var(--base-common-padding-xl, 16px));
  row-gap: var(--base-token-input-gap, var(--base-gap, 8px));
`

export const Title = styled.h3.attrs({ className: 'tokenInputTitle' })`
  color: var(--theme-token-input-title-color, #2e3048);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
`

export const TopRow = styled.div.attrs({ className: 'tokenInputTopRow' })`
  column-gap: var(--base-gap, 8px);
  display: flex;
  height: 42px;

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      height: 58px;
    `,
  )}
`

export const Textfield = styled(BaseTextfield).attrs({
  className: 'tokenInputTextfield',
})`
  && {
    /* Texfield */
    --theme-textfield-background-color: var(
      --theme-token-input-textfield-background-color,
      #fff
    );
    --theme-textfield-background-color-active: var(
      --theme-token-input-textfield-background-color-active,
      rgb(0 0 0 / 2%)
    );
    --theme-textfield-border-color: var(
      --theme-token-input-textfield-border-color,
      #e2e0e7
    );
    --theme-textfield-border-color-active: var(
      --theme-token-input-textfield-border-color-active,
      #e2e0e7
    );
    --theme-textfield-color: var(--theme-token-input-textfield-color, #2e3048);
    --theme-textfield-color-active: var(
      --theme-token-input-textfield-color-active,
      #2e3048
    );
    --theme-textfield-placeholder-color: var(
      --theme-token-input-textfield-placeholder-color,
      rgb(22 29 26 / 60%)
    );

    font-size: 2.4rem;
    height: auto;
    min-width: 0;
    padding: var(
      --base-token-input-texfield-padding,
      var(--base-common-padding, 8px)
    );

    ${breakpointMediaQuery(
      'tabletPortraitStart',
      css`
        font-size: 3.2rem;
        padding: var(
          --base-token-input-texfield-padding,
          0 var(--base-common-padding-xl, 16px)
        );
      `,
    )}
  }
`

export const ChevronDown = styled(BaseChevronDown)`
  margin-left: var(--base-gap, 8px);
`

const ButtonCSS = css`
  --theme-button-background-color: var(
    --theme-token-input-dropdown-button-background-color,
    #fff
  );
  --theme-button-background-color-hover: var(
    --theme-token-input-dropdown-button-background-color-hover,
    rgb(0 0 0 / 5%)
  );
  --theme-button-border-color: var(
    --theme-token-input-dropdown-button-border-color,
    #e2e0e7
  );
  --theme-button-border-color-hover: var(
    --theme-token-input-dropdown-button-border-color-hover,
    #e2e0e7
  );
  --theme-button-border-color-active: var(
    --theme-token-input-dropdown-button-border-color-active,
    #e2e0e7
  );
  --theme-button-color: var(--theme-token-input-dropdown-button-color, #2e3048);
  --theme-button-color-hover: var(
    --theme-token-input-dropdown-button-color-hover,
    #2e3048
  );

  flex-shrink: 0;
  font-size: 1.2rem;
  font-weight: 500;
  height: auto;
  min-width: 100px;
  padding: var(
    --base-token-input-dropdown-button-padding,
    0 var(--base-common-padding, 8px)
  );

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      font-size: 1.6rem;
      padding: var(
        --base-token-input-dropdown-button-padding,
        0 var(--base-common-padding-xl, 16px)
      );
    `,
  )}
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
  ${ButtonCSS}
`

export const SingleToken = styled.div.attrs(() => {
  return { className: 'tokenInputSingleToken' }
})`
  align-items: center;
  column-gap: var(--base-button-column-gap, var(--base-gap, 8px));
  cursor: default;
  display: flex;

  ${ButtonCSS}
`

export const ErrorComponent = styled.span`
  color: var(--theme-color-danger, #800);
  font-size: 1.2rem;
  font-weight: 700;
  padding: 0;
`

export const BottomRow = styled.div.attrs(() => {
  return { className: 'tokenInputBottomRow' }
})`
  column-gap: var(--base-gap, 8px);
  display: flex;
  justify-content: space-between;
`

export const EstimatedUSDValue = styled.div.attrs(() => {
  return { className: 'tokenInputEstimatedUSDValue' }
})`
  align-items: center;
  color: var(--theme-token-input-estimated-usd-color, #4b4d60);
  display: flex;
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

export const Balance = styled.div.attrs(() => {
  return { className: 'tokenInputBalance' }
})`
  align-items: center;
  color: var(--theme-token-input-balance-color, #4b4d60);
  column-gap: var(--base-gap, 8px);
  display: flex;
`

export const BalanceValue = styled.span.attrs(() => {
  return { className: 'tokenInputBalanceValue' }
})`
  font-size: 1.2rem;
  font-weight: 400;
  line-height: 1.2;
`

export const MaxButton = styled(Button).attrs(() => {
  return {
    className: 'tokenInputMaxButton',
  }
})`
  /* Max button */
  --theme-button-background-color: var(
    --theme-token-input-max-button-background-color,
    #fff
  );
  --theme-button-background-color-hover: var(
    --theme-token-input-max-button-background-color-hover,
    rgb(0 0 0 / 5%)
  );
  --theme-button-border-color: var(
    --theme-token-input-max-button-border-color,
    #e2e0e7
  );
  --theme-button-border-color-hover: var(
    --theme-token-input-max-button-border-color-hover,
    #e2e0e7
  );
  --theme-button-border-color-active: var(
    --theme-token-input-max-button-border-color-active,
    #e2e0e7
  );
  --theme-button-color: var(--theme-token-input-max-button-color, #8b46a4);
  --theme-button-color-hover: var(
    --theme-token-input-max-button-color-hover,
    #8b46a4
  );

  font-size: 1.2rem;
  font-weight: 400;
  height: 22px;
  padding-left: var(--base-common-padding, 8px);
  padding-right: var(--base-common-padding, 8px);
`

export const Icon = styled.div.attrs<{ $iconSize?: number }>(() => {
  return { className: 'tokenInputIcon' }
})`
  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  height: ${({ $iconSize }) => $iconSize}px;
  justify-content: center;
  overflow: hidden;
  width: ${({ $iconSize }) => $iconSize}px;
`

export const CloseButton = styled.button.attrs(() => {
  return { children: <CloseIcon /> }
})`
  background: none;
  border: none;
  color: var(--theme-token-select-title-color-default);
  cursor: pointer;
  position: absolute;
  right: calc(var(--base-common-padding, 8px) * 2);
  top: calc(var(--base-common-padding, 8px) * 5);

  &:active {
    opacity: 0.7;
  }
`
