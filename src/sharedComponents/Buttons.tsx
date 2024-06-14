import styled from 'styled-components'

import { ThemedButton } from 'db-ui-toolkit'

/**
 * Preset buttons. Just for convenience, these can be modified anywhere else,
 * even the $cssVarRoot prop.
 */
export const PrimaryButton = styled(ThemedButton).attrs({
  $cssVarRoot: '--theme-button-primary',
})``

export const SecondaryButton = styled(ThemedButton).attrs({
  $cssVarRoot: '--theme-button-secondary',
})``
