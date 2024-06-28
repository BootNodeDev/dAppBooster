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

  /* Text color */
  --theme-color-text-primary: #2e3048;
  --theme-color-text: #4b4d60;
  --theme-color-light: #5f6178;
  --theme-color-dark: #000;

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
  --theme-dropdown-item-background-color-hover: transparent;
  --theme-dropdown-item-background-color-active: rgb(0 0 0 / 10%);

  --theme-dropdown-item-color: #2e3048;
  --theme-dropdown-item-color-hover: #2e3048;
  --theme-dropdown-item-color-active: #2e3048;

  --theme-dropdown-item-border-color: #f0f0f0;
  --theme-dropdown-item-border-color-hover: #f0f0f0;
  --theme-dropdown-item-border-color-active: #f0f0f0;

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

  /* GeneralError */
  --theme-generic-error-background-color: #fff;
  --theme-generic-error-border-color: #fff;
  --theme-generic-error-box-shadow: 0 0 20px 0 rgb(0 0 0 / 8%);
  --theme-generic-error-color-message-background: #e2e0e780;
  --theme-generic-error-color-text: #4b4d60;
  --theme-generic-error-color-title: #2e3048;

  /* Spinner */
  --theme-spinner-color: #692581;
`

export default lightThemeCSSVars