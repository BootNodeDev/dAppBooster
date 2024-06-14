import styled from 'styled-components'

import { ThemedButton } from 'db-ui-toolkit'

const ConnectButton = styled(ThemedButton).attrs({
  $cssVarRoot: '--theme-button-connect',
})`
  && {
    --base-button-height: 44px;

    font-weight: 700;
  }
`

export default ConnectButton
