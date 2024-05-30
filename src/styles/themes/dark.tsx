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

    /**
     * From here on put the variables that you will use in your CSS elsewhere.
     */
    --theme-color-primary: #c670e5;
    --theme-color-secondary: #8b46a4;
    --theme-color-text: #e2e0e7;

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
  }
`
