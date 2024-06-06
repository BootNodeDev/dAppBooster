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

    /**
     * From here on put the variables that you will use in your CSS elsewhere.
     */
    --theme-color-primary: var(--theme-color-1);
    --theme-color-secondary: var(--theme-color-2);
    --theme-color-text: var(--theme-color-3);
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
    --theme-button-connect-background-color: #fff;
    --theme-button-connect-background-color-hover: #fff;

    --theme-button-connect-border-color: #fff;
    --theme-button-connect-border-color-hover: #fff;

    --theme-button-connect-color: var(--theme-color-1);
    --theme-button-connect-color-hover: var(--theme-color-4);

    --theme-button-connect-background-color-disabled: #fff;
    --theme-button-connect-border-color-disabled: #fff;
    --theme-button-connect-color-disabled: var(--theme-color-7);

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
  }
`
