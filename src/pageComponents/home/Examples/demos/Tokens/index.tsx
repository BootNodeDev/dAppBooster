import { useCallback } from 'react'
import styled, { keyframes } from 'styled-components'

import { Button } from 'db-ui-toolkit'
import { arbitrum, mainnet, polygon } from 'viem/chains'

import { useTokens } from '@/src/hooks/useTokens'
import TokensList from '@/src/pageComponents/home/Examples/demos/TokensList'
import {
  type WithSuspenseAndRetryProps,
  withSuspense,
  withSuspenseAndRetry,
} from '@/src/utils/suspenseWrapper'

const TokensMainnet = withSuspense(() => {
  const { tokensByChainId } = useTokens()

  return (
    <>
      <strong>{mainnet.name}</strong>
      <TokensList tokenList={tokensByChainId[mainnet.id]} />
    </>
  )
})

const TokensArbitrum = withSuspenseAndRetry(() => {
  const { tokensByChainId } = useTokens()

  return (
    <>
      <strong>{arbitrum.name}</strong>
      <TokensList tokenList={tokensByChainId[arbitrum.id]} />
    </>
  )
})

const TokensPolygon = withSuspenseAndRetry(() => {
  const { tokensByChainId } = useTokens()

  return (
    <>
      <strong>{polygon.name}</strong>
      <TokensList tokenList={tokensByChainId[polygon.id]} />
    </>
  )
})

const Wrapper = styled.div`
  * {
    font-size: 0.9em;
  }

  display: flex;
  direction: row;
  column-gap: 1em;
  outline: 1px solid #afafaf;
  padding: 10px;
`

const TokenListWrapper = styled.div`
  width: 30%;
`

const ErrorMessage = styled.p`
  font-weight: 600;
  color: magenta;
`

const pulse = keyframes`
  0% {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
  50% {
    -webkit-transform: scale(0.8);
    transform: scale(0.8);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  `

const Loading = styled.img`
  animation: ${pulse} 1s linear infinite;
`

const MultipleTokens = () => {
  const retry = useCallback<Required<WithSuspenseAndRetryProps>['fallbackRender']>(
    ({ resetErrorBoundary }) => (
      <div>
        <Button onClick={resetErrorBoundary}>again!</Button>
      </div>
    ),
    [],
  )
  return (
    <Wrapper>
      <TokenListWrapper>
        <TokensMainnet errorFallback={<ErrorMessage>oh no! 🙀</ErrorMessage>} />
      </TokenListWrapper>
      <TokenListWrapper>
        <TokensArbitrum suspenseFallback="loading arbitrum tokens..." />
      </TokenListWrapper>
      <TokenListWrapper>
        <TokensPolygon
          fallbackRender={retry}
          suspenseFallback={<Loading height="24" src="/appLogo.svg" />}
        />
      </TokenListWrapper>
    </Wrapper>
  )
}

export default MultipleTokens
