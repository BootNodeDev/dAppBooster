import { type FC } from 'react'
import styled from 'styled-components'

import BaseTokenSelect, { Loading } from '@/src/sharedComponents/TokenSelect'
import { type Token } from '@/src/types/token'

const TokenSelect = styled(BaseTokenSelect)`
  box-shadow: none;
  padding-top: var(--base-common-padding-xl);
`

const AddTokensOrSwitchNetworkDemo: FC = ({ ...restProps }) => {
  const onTokenSelect = (token: Token | undefined) => {
    console.log(token)
  }

  return (
    <TokenSelect
      onTokenSelect={onTokenSelect}
      showAddTokenButton
      showSwitchNetworkButton
      suspenseFallback={<Loading />}
      {...restProps}
    />
  )
}

export default AddTokensOrSwitchNetworkDemo
