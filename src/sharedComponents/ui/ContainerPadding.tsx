import { css } from 'styled-components'

import { breakpointMediaQuery } from '@/src/styles/breakpoints'

export const ContainerPadding = css`
  padding-left: var(--base-padding-sm);
  padding-right: var(--base-padding-sm);

  ${breakpointMediaQuery(
    'tabletPortraitStart',
    css`
      padding-left: var(--base-padding);
      padding-right: var(--base-padding);
    `,
  )}

  ${breakpointMediaQuery(
    'tabletLandscapeStart',
    css`
      padding-left: var(--base-padding);
      padding-right: var(--base-padding);
    `,
  )}

${breakpointMediaQuery(
    'desktopStart',
    css`
      padding-left: var(--base-padding-xl);
      padding-right: var(--base-padding-xl);
    `,
  )}

${breakpointMediaQuery(
    'desktopWideStart',
    css`
      padding-left: var(--base-padding-xl);
      padding-right: var(--base-padding-xl);
    `,
  )}
`
