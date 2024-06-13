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
    --theme-color-text: #e2e0e7;

    /* Danger / OK / warning */
    --theme-color-danger: #800;
    --theme-color-ok: #080;
    --theme-color-warning: #cc0;

    /* Main body */
    --theme-body-background-color: #292b43;

    /* Header */
    --theme-header-background-color: transparent;
    --theme-header-text-color: #fff;

    /* Main Menu */
    --theme-main-menu-item-color: #fff;

    /* Button Primary */
    --theme-button-primary-background-color: #8b46a4;
    --theme-button-primary-background-color-hover: #2e3048;

    --theme-button-primary-border-color: #8b46a4;
    --theme-button-primary-border-color-hover: #2e3048;

    --theme-button-primary-color: #fff;
    --theme-button-primary-color-hover: #fff;

    --theme-button-primary-background-color-disabled: #f7f7f7;
    --theme-button-primary-border-color-disabled: #e2e0e7;
    --theme-button-primary-color-disabled: #c5c2cb;

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
    --copy-button-color: #e2e0e7;
    --copy-button-color-hover: #c670e5;

    /* External link button */
    --external-link-button-color: #e2e0e7;
    --external-link-button-color-hover: #c670e5;
  }
`
