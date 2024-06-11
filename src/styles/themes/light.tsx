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
    /**
     * Colors.
     *
     * Numbered-named vars. Don't use them directly in your CSS.
     *
     * I think that using numbered names doesn't look great, but it ends up
     * being very practical. Use these values to create properly named variables
     * below.
     */
    --theme-color-0: #fff;
    --theme-color-1: #2e3048;
    --theme-color-2: #692581;
    --theme-color-3: #4b4d60;
    --theme-color-4: #8b46a4;
    --theme-color-5: #f7f7f7;
    --theme-color-6: #e2e0e7;
    --theme-color-7: #c5c2cb;
    --theme-color-8: #f6f6f6;
    --theme-color-9: #f8f8f8;
    --theme-color-10: #800;
    --theme-color-11: #080;
    --theme-color-12: #cc0;
    --theme-color-13: #f0f0f0;
    --theme-color-14: #000;

    /**
     * From here on put the variables that you will use in your CSS elsewhere.
     */
    --theme-color-primary: var(--theme-color-1);
    --theme-color-secondary: var(--theme-color-2);
    --theme-color-text: var(--theme-color-3);

    /* Danger / OK / warning */
    --theme-color-danger: var(--theme-color-10);
    --theme-color-ok: var(--theme-color-11);
    --theme-color-warning: var(--theme-color-12);

    /* Main body */
    --theme-body-background: linear-gradient(
      257deg,
      var(--theme-color-8) 0%,
      var(--theme-color-9) 100%
    );

    /* Header */
    --theme-header-background-color: transparent;
    --theme-header-text-color: var(--theme-color-1);

    /* Main Menu */
    --theme-main-menu-item-color: var(--theme-color-1);

    /* Primary Button */
    --theme-button-primary-background-color: var(--theme-color-4);
    --theme-button-primary-background-color-hover: var(--theme-color-1);

    --theme-button-primary-border-color: var(--theme-color-4);
    --theme-button-primary-border-color-hover: var(--theme-color-1);

    --theme-button-primary-color: var(--theme-color-0);
    --theme-button-primary-color-hover: var(--theme-color-0);

    --theme-button-primary-background-color-disabled: var(--theme-color-5);
    --theme-button-primary-border-color-disabled: var(--theme-color-6);
    --theme-button-primary-color-disabled: var(--theme-color-7);

    /* Connect Button */
    --theme-button-connect-background-color: var(--theme-color-0);
    --theme-button-connect-background-color-hover: var(--theme-color-0);

    --theme-button-connect-border-color: var(--theme-color-0);
    --theme-button-connect-border-color-hover: var(--theme-color-0);

    --theme-button-connect-color: var(--theme-color-1);
    --theme-button-connect-color-hover: var(--theme-color-4);

    --theme-button-connect-background-color-disabled: var(--theme-color-0);
    --theme-button-connect-border-color-disabled: var(--theme-color-0);
    --theme-button-connect-color-disabled: var(--theme-color-7);

    /* Dropdown */
    --theme-dropdown-background-color: var(--theme-color-0);
    --theme-dropdown-border-color: var(--theme-color-0);

    --theme-dropdown-box-shadow: 0 9.6px 13px 0 rgb(0 0 0 / 8%);

    --theme-dropdown-item-background-color: transparent;
    --theme-dropdown-item-background-color-hover: transparent;
    --theme-dropdown-item-background-color-active: rgb(0 0 0 / 10%);

    --theme-dropdown-item-color: var(--theme-color-1);
    --theme-dropdown-item-color-hover: var(--theme-color-1);
    --theme-dropdown-item-color-active: var(--theme-color-1);

    --theme-dropdown-item-border-color: var(--theme-color-13);
    --theme-dropdown-item-border-color-hover: var(--theme-color-13);
    --theme-dropdown-item-border-color-active: var(--theme-color-13);

    /* Card */
    --theme-card-background-color: var(--theme-color-0);
    --theme-card-border-color: var(--theme-color-0);
    --theme-card-box-shadow: 0 9.6px 13px 0 rgb(0 0 0 / 8%);

    /* Copy button */
    --copy-button-color: var(--theme-color-14);
    --copy-button-color-hover: var(--theme-color-4);

    /* External link button */
    --external-link-button-color: var(--theme-color-14);
    --external-link-button-color-hover: var(--theme-color-4);
  }
`
