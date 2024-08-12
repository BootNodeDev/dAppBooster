import { css } from 'styled-components'

import { breakpointMediaQuery } from 'db-ui-toolkit'

export const ButtonCSS = css`
  column-gap: calc(var(--base-gap) * 2);
  font-size: 1.8rem;
  height: 50px;
  padding-left: var(--base-common-padding-xl);
  padding-right: var(--base-common-padding-xl);
  min-width: 132px;
  justify-content: start;

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      min-width: 156px;
      padding-left: calc(var(--base-common-padding-xl) * 2);
      padding-right: calc(var(--base-common-padding-xl) * 2);
    `,
  )}
`
