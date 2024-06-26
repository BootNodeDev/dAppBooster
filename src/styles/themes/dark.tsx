import { css } from 'styled-components'

/**
 * Dark theme variables.
 *
 * It should be mainly colors, probably some background images too. Things that
 * change when you change themes, nothing else.
 *
 * Use a --theme prefix to indicate that these variables are theme-specific.
 */
export const darkTheme = css`
  &[data-theme='dark'] {
    /* Few basic colors */
    --theme-color-primary: #8b46a4;

    /* Text color */
    --theme-color-text-primary: #fff;
    --theme-color-text: #e2e0e7;
    --theme-color-light: #4b4d60;
    --theme-color-dark: #4b4d60;

    /* Danger / OK / warning */
    --theme-color-danger: #800;
    --theme-color-ok: #080;
    --theme-color-warning: #cc0;

    /* Main body */
    --theme-body-background-color: #292b43;

    /* Header */
    --theme-header-background-color: transparent;
    --theme-header-text-color: #fff;

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
    --theme-dropdown-item-background-color-hover: transparent;
    --theme-dropdown-item-background-color-active: rgb(0 0 0 / 10%);

    --theme-dropdown-item-color: #fff;
    --theme-dropdown-item-color-hover: #fff;
    --theme-dropdown-item-color-active: #fff;

    --theme-dropdown-item-border-color: #4b4d60;
    --theme-dropdown-item-border-color-hover: #4b4d60;
    --theme-dropdown-item-border-color-active: #4b4d60;

    /* Card */
    --theme-card-background-color: #292b43;
    --theme-card-border-color: #292b43;
    --theme-card-box-shadow: 0 9.6px 13px 0 rgb(0 0 0 / 8%);

    /* Copy button */
    --theme-copy-button-color: #e2e0e7;
    --theme-copy-button-color-hover: #c670e5;

    /* External link button */
    --theme-external-link-button-color: #e2e0e7;
    --theme-external-link-button-color-hover: #c670e5;

    /* Toast */
    --theme-toast-background-color: #4b4d60;
    --theme-toast-color: #fff;
  }
`
