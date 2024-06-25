import styled from 'styled-components'

import { Title } from 'db-ui-toolkit'
import { arbitrum, mainnet } from 'viem/chains'

import TokensList from '@/src/pageComponents/home/Examples/demos/TokensList'
import { useTokens } from '@/src/sharedComponents/TokensProvider'

export const TokensMainnet = () => {
  const { tokensByChainId } = useTokens()

  return (
    <div>
      <Title>Mainnet</Title>
      <TokensList tokenList={tokensByChainId[mainnet.id]} />
    </div>
  )
}

export const TokensArbitrum = () => {
  const { tokensByChainId } = useTokens()

  return (
    <div>
      <Title>Arbitrum</Title>
      <TokensList tokenList={tokensByChainId[arbitrum.id]} />
    </div>
  )
}

const Wrapper = styled.div`
  display: flex;
  direction: row;
  column-gap: 30px;
  outline: 1px solid #afafaf;
  padding: 10px;
`
const MultipleTokens = () => {
  return (
    <Wrapper>
      <TokensMainnet />
      <TokensArbitrum />
    </Wrapper>
  )
}

export default MultipleTokens
