import { useCallback, useState } from 'react'
import styled, { keyframes } from 'styled-components'

import { Button } from 'db-ui-toolkit'
import * as chains from 'viem/chains'

import { useTokens } from '@/src/hooks/useTokens'
import TokenInput from '@/src/sharedComponents/Tokens/TokenInput'
import TokenList, { type TokenListProps } from '@/src/sharedComponents/Tokens/TokenList'
import { type Token } from '@/src/token'
import {
  type WithSuspenseAndRetryProps,
  withSuspense,
  withSuspenseAndRetry,
} from '@/src/utils/suspenseWrapper'

const { arbitrum, mainnet, polygon } = chains

type TokenSelector = Omit<TokenListProps, 'tokenList'>

const TokensMainnet = withSuspense<TokenSelector>(({ onTokenSelected, searchPlaceholder }) => {
  const { tokensByChainId } = useTokens()

  return (
    <>
      <strong>{mainnet.name}</strong>
      <TokenList
        onTokenSelected={onTokenSelected}
        searchPlaceholder={searchPlaceholder}
        tokenList={tokensByChainId[mainnet.id]}
      />
    </>
  )
})

const TokensArbitrum = withSuspenseAndRetry<TokenSelector>(
  ({ onTokenSelected, searchPlaceholder }) => {
    const { tokensByChainId } = useTokens()

    return (
      <>
        <strong>{arbitrum.name}</strong>
        <TokenList
          onTokenSelected={onTokenSelected}
          searchPlaceholder={searchPlaceholder}
          tokenList={tokensByChainId[arbitrum.id]}
        />
      </>
    )
  },
)

const TokensPolygon = withSuspenseAndRetry<TokenSelector>(
  ({ onTokenSelected, searchPlaceholder }) => {
    const { tokensByChainId } = useTokens()

    return (
      <>
        <strong>{polygon.name}</strong>
        <TokenList
          onTokenSelected={onTokenSelected}
          searchPlaceholder={searchPlaceholder}
          tokenList={tokensByChainId[polygon.id]}
        />
      </>
    )
  },
)

const Container = styled.div`
  * {
    font-size: 0.9em;
  }

  display: grid;
`

const Wrapper = styled.div`
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
  const [selectedToken, setSelectedToken] = useState<Token>()
  const retry = useCallback<Required<WithSuspenseAndRetryProps>['fallbackRender']>(
    ({ resetErrorBoundary }) => (
      <div>
        <Button onClick={resetErrorBoundary}>again!</Button>
      </div>
    ),
    [],
  )

  return (
    <Container>
      <TokenInput token={selectedToken} />
      <Wrapper>
        <TokenListWrapper>
          <TokensMainnet
            errorFallback={<ErrorMessage>oh no! 🙀</ErrorMessage>}
            onTokenSelected={setSelectedToken}
          />
        </TokenListWrapper>
        <TokenListWrapper>
          <TokensArbitrum
            onTokenSelected={setSelectedToken}
            suspenseFallback="loading arbitrum tokens..."
          />
        </TokenListWrapper>
        <TokenListWrapper>
          <TokensPolygon
            fallbackRender={retry}
            onTokenSelected={setSelectedToken}
            searchPlaceholder="find it!"
            suspenseFallback={<Loading height="24" src="/appLogo.svg" />}
          />
        </TokenListWrapper>
      </Wrapper>
    </Container>
  )
}

export default MultipleTokens
