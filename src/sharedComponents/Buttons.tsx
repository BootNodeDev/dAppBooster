import styled from 'styled-components'

import { Button } from 'db-ui-toolkit'

/**
 * Preset buttons. Just for convenience, these can be modified anywhere else,
 * even the $cssVarRoot prop.
 */
export const PrimaryButton = styled(Button).attrs({
  $variant: 'primary',
})`
  font-weight: 500;
`

export const SecondaryButton = styled(Button).attrs({
  $variant: 'secondary',
})`
  font-weight: 500;
`
