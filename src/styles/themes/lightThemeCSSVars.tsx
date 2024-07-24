import { css } from 'styled-components'

/**
 * Light theme CSS variables.
 *
 * It should be mainly colors, probably some background images too. Things that
 * change when you change themes, nothing else.
 *
 * Use a --theme prefix to indicate that these variables are theme-specific.
 */
const lightThemeCSSVars = css`
  /* Few basic colors */
  --theme-color-primary: #692581;

  /* Title color */
  --theme-title-color: #2e3048;

  /* Text color */
  --theme-text-color: #4b4d60;

  /* Danger / OK / warning */
  --theme-color-danger: #800;
  --theme-color-ok: #080;
  --theme-color-warning: #cc0;

  /* Main body */
  --theme-body-background-color: #e2e0e7;

  /* Header */
  --theme-header-background-color: transparent;
  --theme-header-text-color: #2e3048;

  /* Footer */
  --theme-footer-background-color: #f7f7f7;
  --theme-footer-text-color: #2e3048;

  /* Main Menu */
  --theme-main-menu-item-color: #2e3048;

  /* Primary Button */
  --theme-button-primary-background-color: #692581;
  --theme-button-primary-background-color-hover: #892fa9;

  --theme-button-primary-border-color: #692581;
  --theme-button-primary-border-color-hover: #892fa9;

  --theme-button-primary-color: #fff;
  --theme-button-primary-color-hover: #fff;

  --theme-button-primary-background-color-disabled: #692581;
  --theme-button-primary-border-color-disabled: #692581;
  --theme-button-primary-color-disabled: #fff;

  /* Secondary Button */
  --theme-button-secondary-background-color: #2e3048;
  --theme-button-secondary-background-color-hover: #3d405f;

  --theme-button-secondary-border-color: #2e3048;
  --theme-button-secondary-border-color-hover: #3d405f;

  --theme-button-secondary-color: #fff;
  --theme-button-secondary-color-hover: #fff;

  --theme-button-secondary-background-color-disabled: #2e3048;
  --theme-button-secondary-border-color-disabled: #2e3048;
  --theme-button-secondary-color-disabled: #fff;

  /* Connect Button */
  --theme-button-connect-background-color: #fff;
  --theme-button-connect-background-color-hover: #fff;

  --theme-button-connect-border-color: #fff;
  --theme-button-connect-border-color-hover: #fff;

  --theme-button-connect-color: #2e3048;
  --theme-button-connect-color-hover: #8b46a4;

  --theme-button-connect-background-color-disabled: #fff;
  --theme-button-connect-border-color-disabled: #fff;
  --theme-button-connect-color-disabled: #c5c2cb;

  /* Dropdown */
  --theme-dropdown-background-color: #fff;
  --theme-dropdown-border-color: #fff;

  --theme-dropdown-box-shadow: 0 0 20px 0 rgb(0 0 0 / 8%);

  --theme-dropdown-item-background-color: transparent;
  --theme-dropdown-item-background-color-hover: rgb(0 0 0 / 2%);
  --theme-dropdown-item-background-color-active: rgb(0 0 0 / 5%);

  --theme-dropdown-item-color: #2e3048;
  --theme-dropdown-item-color-hover: #2e3048;
  --theme-dropdown-item-color-active: #2e3048;

  --theme-dropdown-item-border-color: #f0f0f0;
  --theme-dropdown-item-border-color-hover: #f0f0f0;
  --theme-dropdown-item-border-color-active: #f0f0f0;

  /* Dropdown Button */
  --theme-button-dropdown-background-color: #692581;
  --theme-button-dropdown-background-color-hover: #892fa9;

  --theme-button-dropdown-border-color: #692581;
  --theme-button-dropdown-border-color-hover: #892fa9;

  --theme-button-dropdown-color: #fff;
  --theme-button-dropdown-color-hover: #fff;

  --theme-button-dropdown-background-color-disabled: #692581;
  --theme-button-dropdown-border-color-disabled: #692581;
  --theme-button-dropdown-color-disabled: #fff;

  /* Card */
  --theme-card-background-color: #fff;
  --theme-card-border-color: #fff;
  --theme-card-box-shadow: 0 9.6px 13px 0 rgb(0 0 0 / 8%);

  /* Copy button */
  --theme-copy-button-color: #000;
  --theme-copy-button-color-hover: #8b46a4;

  /* External link button */
  --theme-external-link-button-color: #000;
  --theme-external-link-button-color-hover: #8b46a4;

  /* Toast */
  --theme-toast-background-color: #2e3048;
  --theme-toast-color: #fff;

  /* General Error */
  --theme-general-error-background-color: #fff;
  --theme-general-error-border-color: #fff;
  --theme-general-error-title-color: #2e3048;
  --theme-general-error-message-background-color: #e2e0e780;
  --theme-general-error-message-color: #4b4d60;

  /* Spinner */
  --theme-spinner-color: #692581;

  /* Dialog / Modal */
  --theme-dialog-overlay-color: rgb(0 0 0 / 25%);

  /* Token Select */
  --theme-token-select-title-color: #2e3048;

  --theme-token-select-network-button-color: #2e3048;
  --theme-token-select-network-button-background-color: #f7f7f7;

  --theme-token-select-list-border-top-color: #e2e0e7;

  --theme-token-select-row-background-color: transparent;
  --theme-token-select-row-background-color-hover: rgb(0 0 0 / 5%);
  --theme-token-select-row-token-name-color: #2e3048;
  --theme-token-select-row-token-balance-color: #2e3048;
  --theme-token-select-row-token-value-color: #2e3048;

  --theme-token-select-top-token-item-border-color: #e2e0e7;
  --theme-token-select-top-token-item-color: #2e3048;
  --theme-token-select-top-token-item-background-color-hover: rgb(0 0 0 / 5%);

  --theme-token-select-search-field-color: #2e3048;
  --theme-token-select-search-field-color-active: #2e3048;
  --theme-token-select-search-field-background-color: #f7f7f7;
  --theme-token-select-search-field-background-color-active: #f7f7f7;
  --theme-token-select-search-field-placeholder-color: #161d1a;
  --theme-token-select-search-field-box-shadow: none;
  --theme-token-select-search-field-box-shadow-active: rgb(0 0 0 / 10%);
  --theme-token-select-search-field-border-color: #e2e0e7;
  --theme-token-select-search-field-border-color-active: #e2e0e7;

  /* Token Input */
  --theme-token-input-title-color: #2e3048;

  --theme-token-input-background: #fff;

  --theme-textfield-token-input-background-color: #fff;
  --theme-textfield-token-input-background-color-active: rgb(0 0 0 / 5%);
  --theme-textfield-token-input-border-color: #e2e0e7;
  --theme-textfield-token-input-border-color-active: #e2e0e7;
  --theme-textfield-token-input-color: #2e3048;
  --theme-textfield-token-input-color-active: #2e3048;
  --theme-textfield-token-input-placeholder-color: rgb(22 29 26 / 60%);

  --theme-token-input-dropdown-button-background-color: #fff;
  --theme-token-input-dropdown-button-background-color-hover: rgb(0 0 0 / 5%);
  --theme-token-input-dropdown-button-border-color: #e2e0e7;
  --theme-token-input-dropdown-button-border-color-hover: #e2e0e7;
  --theme-token-input-dropdown-button-border-color-active: #e2e0e7;
  --theme-token-input-dropdown-button-color: #2e3048;
  --theme-token-input-dropdown-button-color-hover: #2e3048;
  --theme-token-input-dropdown-button-background-color-disabled: #fff;
  --theme-token-input-dropdown-button-border-color-disabled: #e2e0e7;
  --theme-token-input-dropdown-button-color-disabled: #2e3048;

  --theme-token-input-max-button-background-color: #fff;
  --theme-token-input-max-button-background-color-hover: rgb(0 0 0 / 5%);
  --theme-token-input-max-button-border-color: #e2e0e7;
  --theme-token-input-max-button-border-color-hover: #e2e0e7;
  --theme-token-input-max-button-border-color-active: #e2e0e7;
  --theme-token-input-max-button-color: #8b46a4;
  --theme-token-input-max-button-color-hover: #8b46a4;
  --theme-token-input-max-button-background-color-disabled: #fff;
  --theme-token-input-max-button-border-color-disabled: #e2e0e7;
  --theme-token-input-max-button-color-disabled: #8b46a4;

  --theme-token-input-estimated-usd-color: #4b4d60;

  --theme-token-input-balance-color: #4b4d60;
`

export default lightThemeCSSVars
