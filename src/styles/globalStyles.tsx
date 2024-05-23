import { createGlobalStyle } from 'styled-components'

import { common } from '@/src/styles/common'
// import { darkTheme } from '@/src/styles/themes/dark'
import { lightTheme } from '@/src/styles/themes/light'

export const GlobalStyles = createGlobalStyle`
  :root {
    ${common}
   }


  html {
    font-size: 10px;
    line-height: 1.5;
    scroll-behavior: smooth;

    ${lightTheme}
    /* Note: Dark theme disabled for now, add it later here */
  }

  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background: var(--theme-body-background);
    background-image: var(--theme-body-background-image);
    background-position: 100% 0;
    background-repeat: no-repeat;
    color: var(--theme-color-text);
    font-family: var(--common-font-family);
    font-size: 1.6rem;
    min-height: 100vh;
    outline-color: var(--theme-color-secondary);
  }

  code {
    font-family: var(--common-font-family-code);
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

  ol, ul {
    list-style: none;
    padding-inline: 0;
  }

  h1, h2, h3, h4, h5 {
    font-size: inherit;
    font-weight: inherit;
  }

  img {
    display: block;
    max-inline-size: 100%;
  }

  a {
    color: var(--theme-color-text);
  }
`