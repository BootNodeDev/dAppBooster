import styled from 'styled-components'

import { ThemedButton } from 'db-ui-toolkit'

const ConnectButton = styled(ThemedButton)`
  --base-button-height: 44px;

  font-weight: 700;
`

ConnectButton.defaultProps = {
  $cssVarRoot: '--theme-button-connect',
}

export default ConnectButton
