import { css } from 'styled-components'

/**
 * Dark theme CSS variables.
 *
 * It should be mainly colors, probably some background images too. Things that
 * change when you change themes, nothing else.
 *
 * Use a --theme prefix to indicate that these variables are theme-specific.
 */
const darkThemeCSSVars = css`
  /* Few basic colors */
  --theme-color-primary: #8b46a4;

  /* Title color */
  --theme-title-color: #fff;

  /* Text color */
  --theme-text-color: #e2e0e7;

  /* Danger / OK / warning */
  --theme-color-danger: #800;
  --theme-color-ok: #080;
  --theme-color-warning: #cc0;

  /* Main body */
  --theme-body-background-color: #292b43;

  /* Header */
  --theme-header-background-color: transparent;
  --theme-header-text-color: #fff;

  /* Mobile menu */
  --theme-main-menu-background-color: #292b43;
  --theme-main-menu-color: #fff;

  /* Footer */
  --theme-footer-background-color: #2e3048;
  --theme-footer-text-color: #c5c2cb;

  /* Main Menu */
  --theme-main-menu-item-color: #fff;

  /* Button Primary */
  --theme-button-primary-background-color: #8b46a4;
  --theme-button-primary-background-color-hover: #9a4eb5;

  --theme-button-primary-border-color: #8b46a4;
  --theme-button-primary-border-color-hover: #9a4eb5;

  --theme-button-primary-color: #fff;
  --theme-button-primary-color-hover: #fff;

  --theme-button-primary-background-color-disabled: #8b46a4;
  --theme-button-primary-border-color-disabled: #8b46a4;
  --theme-button-primary-color-disabled: #fff;

  /* Secondary Button */
  --theme-button-secondary-background-color: #5f6178;
  --theme-button-secondary-background-color-hover: #4a4c5f;

  --theme-button-secondary-border-color: #5f6178;
  --theme-button-secondary-border-color-hover: #4a4c5f;

  --theme-button-secondary-color: #fff;
  --theme-button-secondary-color-hover: #fff;

  --theme-button-secondary-background-color-disabled: #5f6178;
  --theme-button-secondary-border-color-disabled: #5f6178;
  --theme-button-secondary-color-disabled: #fff;

  /* Connect Button */
  --theme-button-connect-background-color: #8b46a4;
  --theme-button-connect-background-color-hover: #5f6178;

  --theme-button-connect-border-color: #8b46a4;
  --theme-button-connect-border-color-hover: #5f6178;

  --theme-button-connect-color: #fff;
  --theme-button-connect-color-hover: #fff;

  --theme-button-connect-background-color-disabled: #8b46a4;
  --theme-button-connect-border-color-disabled: #8b46a4;
  --theme-button-connect-color-disabled: #c5c2cb;

  /* Dropdown */
  --theme-dropdown-background-color: #292b43;
  --theme-dropdown-border-color: #292b43;

  --theme-dropdown-box-shadow: 0 9.6px 13px 0 rgb(0 0 0 / 8%);

  --theme-dropdown-item-background-color: transparent;
  --theme-dropdown-item-background-color-hover: rgb(255 255 255 / 2%);
  --theme-dropdown-item-background-color-active: rgb(255 255 255 / 5%);

  --theme-dropdown-item-color: #fff;
  --theme-dropdown-item-color-hover: #fff;
  --theme-dropdown-item-color-active: #fff;

  --theme-dropdown-item-border-color: #4b4d60;
  --theme-dropdown-item-border-color-hover: #4b4d60;
  --theme-dropdown-item-border-color-active: #4b4d60;

  /* Dropdown Button  */
  --theme-button-dropdown-background-color: #8b46a4;
  --theme-button-dropdown-background-color-hover: #9a4eb5;

  --theme-button-dropdown-border-color: #8b46a4;
  --theme-button-dropdown-border-color-hover: #9a4eb5;

  --theme-button-dropdown-color: #fff;
  --theme-button-dropdown-color-hover: #fff;

  --theme-button-dropdown-background-color-disabled: #8b46a4;
  --theme-button-dropdown-border-color-disabled: #8b46a4;
  --theme-button-dropdown-color-disabled: #fff;

  /* Card */
  --theme-card-background-color: #232436;
  --theme-card-border-color: #232436;
  --theme-card-box-shadow: 0 0 20px 0 rgb(255 255 255 / 8%);

  /* Copy button */
  --theme-copy-button-color: #e2e0e7;
  --theme-copy-button-color-hover: #c670e5;

  /* External link button */
  --theme-external-link-button-color: #e2e0e7;
  --theme-external-link-button-color-hover: #c670e5;

  /* Toast */
  --theme-toast-background-color: #4b4d60;
  --theme-toast-color: #fff;

  /* General Error */
  --theme-general-error-background-color: #232436;
  --theme-general-error-border-color: #232436;
  --theme-general-error-title-color: #fff;
  --theme-general-error-message-background-color: #292b43;
  --theme-general-error-message-color: #fff;

  /* Spinner */
  --theme-spinner-color: #b886c9;

  /* Dialog / Modal */
  --theme-dialog-overlay-color: rgb(0 0 0 / 50%);

  /* Token Select */
  --theme-token-select-background-color: #2e3048;
  --theme-token-select-border-color: #2e3048;
  --theme-token-select-title-color: #fff;

  --theme-token-select-network-button-color: #fff;
  --theme-token-select-network-button-background-color: #292b43;

  --theme-token-select-list-border-top-color: #4b4d60;

  --theme-token-select-row-background-color: transparent;
  --theme-token-select-row-background-color-hover: rgb(255 255 255 / 5%);
  --theme-token-select-row-token-name-color: #fff;
  --theme-token-select-row-token-balance-color: #fff;
  --theme-token-select-row-token-value-color: #fff;

  --theme-token-select-top-token-item-background-color: #2e3048;
  --theme-token-select-top-token-item-border-color: #4b4d60;
  --theme-token-select-top-token-item-color: #fff;
  --theme-token-select-top-token-item-background-color-hover: rgb(255 255 255 / 5%);

  --theme-token-select-search-field-color: #fff;
  --theme-token-select-search-field-color-active: #fff;
  --theme-token-select-search-field-background-color: #292b43;
  --theme-token-select-search-field-background-color-active: #292b43;
  --theme-token-select-search-field-placeholder-color: #ddd;
  --theme-token-select-search-field-box-shadow: none;
  --theme-token-select-search-field-box-shadow-active: none;
  --theme-token-select-search-field-border-color: #5f6178;
  --theme-token-select-search-field-border-color-active: #5f6178;

  --theme-token-select-add-erc20-token-button-background-color: #5f6178;
  --theme-token-select-add-erc20-token-button-background-color-hover: #4a4c5f;
  --theme-token-select-add-erc20-token-button-border-color: #5f6178;
  --theme-token-select-add-erc20-token-button-border-color-hover: #4a4c5f;
  --theme-token-select-add-erc20-token-button-color: #fff;
  --theme-token-select-add-erc20-token-button-color-hover: #fff;

  /* Token Input */
  --theme-token-input-title-color: #fff;

  --theme-token-input-background: #373954;

  --theme-token-input-textfield-background-color: #373954;
  --theme-token-input-textfield-background-color-active: rgb(255 255 255 / 5%);
  --theme-token-input-textfield-border-color: #5f6178;
  --theme-token-input-textfield-border-color-active: #5f6178;
  --theme-token-input-textfield-color: rgb(255 255 255 / 80%);
  --theme-token-input-textfield-color-active: rgb(255 255 255 / 80%);
  --theme-token-input-textfield-placeholder-color: rgb(255 255 255 / 50%);

  --theme-token-input-dropdown-button-background-color: #373954;
  --theme-token-input-dropdown-button-background-color-hover: rgb(255 255 255 / 5%);
  --theme-token-input-dropdown-button-border-color: #5f6178;
  --theme-token-input-dropdown-button-border-color-hover: #5f6178;
  --theme-token-input-dropdown-button-border-color-active: #5f6178;
  --theme-token-input-dropdown-button-color: #fff;
  --theme-token-input-dropdown-button-color-hover: #fff;
  --theme-token-input-dropdown-button-background-color-disabled: #373954;
  --theme-token-input-dropdown-button-border-color-disabled: #5f6178;
  --theme-token-input-dropdown-button-color-disabled: #fff;

  --theme-token-input-max-button-background-color: #373954;
  --theme-token-input-max-button-background-color-hover: rgb(255 255 255 / 5%);
  --theme-token-input-max-button-border-color: #c5c2cb;
  --theme-token-input-max-button-border-color-hover: #c5c2cb;
  --theme-token-input-max-button-border-color-active: #c5c2cb;
  --theme-token-input-max-button-color: #c670e5;
  --theme-token-input-max-button-color-hover: #c670e5;
  --theme-token-input-max-button-background-color-disabled: #373954;
  --theme-token-input-max-button-border-color-disabled: #5f6178;
  --theme-token-input-max-button-color-disabled: #fff;

  --theme-token-input-estimated-usd-color: #e2e0e7;

  --theme-token-input-balance-color: #e2e0e7;
`

export default darkThemeCSSVars
