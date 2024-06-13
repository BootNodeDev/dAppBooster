import styled from 'styled-components'

import { ThemedButton } from 'db-ui-toolkit'

/**
 * Preset buttons. Just for convenience, these can be modified anywhere else,
 * even the $cssVarRoot prop.
 */
export const PrimaryButton = styled(ThemedButton)``

PrimaryButton.defaultProps = {
  $cssVarRoot: '--theme-button-primary',
}

export const SecondaryButton = styled(ThemedButton)``

SecondaryButton.defaultProps = {
  $cssVarRoot: '--theme-button-secondary',
}
