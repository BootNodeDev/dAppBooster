import { css } from 'styled-components'

/**
 * Common, global, general use CSS variables. Don't put any colors here.
 *
 * I suggest your use a --common prefix to indicate that these variables are not
 * theme-specific and to avoid conflicts with other CSS variables.
 */
export const common = css`
  --common-border-radius-xs: 2px;
  --common-border-radius-sm: 4px;
  --common-border-radius: 8px;
  --common-border-radius-xl: 16px;

  --common-gap-sm: 4px;
  --common-gap: 8px;
  --common-gap-xl: 16px;

  --common-font-family: 'Manrope', 'Arial', 'Helvetica Neue', 'Helvetica', sans-serif;
  --common-font-family-code: 'Roboto Mono', 'Courier New', monospace;

  --common-horizontal-padding-desktop-start: 20px;
  --common-horizontal-padding-desktop-wide-start: 20px;
  --common-horizontal-padding-mobile: 10px;
  --common-horizontal-padding-tablet-landscape-start: 15px;
  --common-horizontal-padding-tablet-portrait-start: 15px;

  --common-container-max-width: 1360px;

  --common-header-height: 96px;
  --common-footer-height: 92px;

  --common-modal-width-sm: 250px;
  --common-modal-width-md: 400px;
  --common-modal-width-xl: 800px;
`
