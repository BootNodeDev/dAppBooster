import styled from 'styled-components'

import TokenInput from '@/src/components/sharedComponents/TokenInput'
import { useTokenInput } from '@/src/components/sharedComponents/TokenInput/useTokenInput'
import { useTokenLists } from '@/src/hooks/useTokenLists'
import { useTokenSearch } from '@/src/hooks/useTokenSearch'

const CustomTokenInput = styled(TokenInput)`
  --base-token-input-border-radius: 0;
  --base-token-input-padding: 30px;

  /* Applies to component's wrapper */
  margin: auto;

  /* Title */
  .tokenInputTitle {
    font-size: 18px;
    font-weight: 700;
    padding-bottom: 8px;
  }

  /* Input component */
  .tokenInputTextfield {
    font-size: 20px;
  }
`

export const Home = () => {
  const { tokensByChainId } = useTokenLists()
  const { searchResult } = useTokenSearch({ tokens: tokensByChainId[1], defaultSearchTerm: 'WETH' })
  const tokenInputSingle = useTokenInput(searchResult[0])

  return (
    <CustomTokenInput
      currentNetworkId={1}
      singleToken
      title="You pay"
      tokenInput={tokenInputSingle}
    />
  )
}
