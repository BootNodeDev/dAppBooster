import styled from 'styled-components'

import { ThemedButton } from 'db-ui-toolkit'

export const PrimaryButton = styled(ThemedButton)``

PrimaryButton.defaultProps = {
  $cssVarRoot: '--theme-button-primary',
}
