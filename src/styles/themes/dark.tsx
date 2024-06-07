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
    --theme-color-8: #800;
    --theme-color-9: #080;
    --theme-color-10: #cc0;

    /**
     * From here on put the variables that you will use in your CSS elsewhere.
     */
    --theme-color-primary: #c670e5;
    --theme-color-secondary: #8b46a4;
    --theme-color-text: #e2e0e7;
    --theme-color-danger: var(--theme-color-8);
    --theme-color-ok: var(--theme-color-9);
    --theme-color-warning: var(--theme-color-10);

    /* Main body */
    --theme-body-background: var(--theme-color-1);

    /* Header */
    --theme-header-background-color: transparent;
    --theme-header-text-color: var(--theme-color-0);

    /* Main Menu */
    --theme-main-menu-item-color: var(--theme-color-0);

    /* Button Primary */
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
  }
`
