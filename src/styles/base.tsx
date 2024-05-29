import { css } from 'styled-components'

/**
 * Base, global, general use CSS variables. Don't put any colors here.
 *
 * I suggest your use a --base prefix to indicate that these variables are not
 * theme-specific and to avoid conflicts with other CSS variables.
 */
export const base = css`
  --base-border-radius-xs: 2px;
  --base-border-radius-sm: 4px;
  --base-border-radius: 8px;
  --base-border-radius-xl: 16px;

  --base-gap-sm: 4px;
  --base-gap: 8px;
  --base-gap-xl: 16px;

  --base-font-family: 'Manrope', 'Arial', 'Helvetica Neue', 'Helvetica', sans-serif;
  --base-font-family-code: 'Roboto Mono', 'Courier New', monospace;

  --base-title-size: 2.4rem;
  --base-text-size: 1.6rem;

  --base-padding-mobile: 4px;
  --base-padding-tablet-portrait: 8px;
  --base-padding-tablet-landscape: 8px;
  --base-padding-desktop: 16px;
  --base-padding-desktop-xl: 16px;

  --base-container-max-width: 1360px;

  --base-button-size: 1.5rem;
  --base-button-height: 38px;

  --base-modal-width-sm: 250px;
  --base-modal-width-md: 400px;
  --base-modal-width-xl: 800px;
`
