import { createGlobalStyle } from 'styled-components'

import globalStyles from '@/src/styles/globalStyles'

/**
 * Global styles, including base and theme CSS variables.
 *
 * This component is used to apply the global styles to the app.
 */
const Styles = createGlobalStyle`
  ${globalStyles}
`

export default Styles
