import { css } from 'styled-components'

import baseCSSVars from '@/src/styles/baseCSSVars'
import darkThemeCSSVars from '@/src/styles/themes/darkThemeCSSVars'
import lightThemeCSSVars from '@/src/styles/themes/lightThemeCSSVars'

const globalStyles = css`
  :root {
    /**
     * Base (non theme-related) CSS variables.
     */
    ${baseCSSVars}
  }

  html {
    /**
     * Theme CSS variables.
     *
     * Light theme is the default theme.
     *
     * You can always remove the &[data-theme='theme'] selector if want to make
     * some theme's CSS vars generally available.
     */
    &[data-theme='light'] {
      ${lightThemeCSSVars}
    }

    &[data-theme='dark'] {
      ${darkThemeCSSVars}
    }

    /**
     * Regular CSS properties
     */
    font-size: 10px;
    scroll-behavior: smooth;
  }

  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: var(--theme-body-background-color, #fff);
    background-position: 100% 0;
    background-repeat: no-repeat;
    color: var(--theme-text-color, #000);
    font-family: var(--base-font-family, sans-serif);
    font-size: var(--base-text-font-size, 16px);
    line-height: 1.5;
    outline-color: var(--theme-color-primary, #ccc);
  }

  code {
    font-family: var(--base-font-family-code, monospace);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  figure,
  p,
  ol,
  ul {
    margin: 0;
  }

  ol,
  ul {
    list-style: none;
    padding-inline: 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    font-size: inherit;
    font-weight: inherit;
  }

  img {
    display: block;
    max-inline-size: 100%;
  }

  a {
    color: var(--theme-color-primary, #000);
  }

  dialog::backdrop {
    background-color: var(--theme-dialog-background-color, rgb(0 0 0 / 20%));
  }
`

export default globalStyles
