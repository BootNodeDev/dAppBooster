import { css } from 'styled-components'

/**
 * Light theme variables.
 *
 * It should be mainly colors, probably some background images too. Things that
 * change when you change themes, nothing else.
 *
 * Use a --theme prefix to indicate that these variables are theme-specific.
 */
export const lightTheme = css`
  [data-theme='light'] {
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

    /* Hlightr */
    --theme-header-background-color: transparent;
    --theme-header-text-color: #2e3048;

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

    --theme-dropdown-box-shadow: 0 9.6px 13px 0 rgb(0 0 0 / 8%);

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
    --copy-button-color: #000;
    --copy-button-color-hover: #8b46a4;

    /* External link button */
    --external-link-button-color: #000;
    --external-link-button-color-hover: #8b46a4;
  }
`
