import React, { useCallback, HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Card, Button } from 'db-ui-toolkit'
import { arbitrum, mainnet, polygon } from 'viem/chains'

import { useTokens } from '@/src/hooks/useTokens'
import TokenList, { type TokenListProps } from '@/src/sharedComponents/Tokens/TokenList'
import {
  type WithSuspenseAndRetryProps,
  withSuspense,
  withSuspenseAndRetry,
} from '@/src/utils/suspenseWrapper'

export type TokenSelector = Omit<TokenListProps, 'tokenList'>

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

const Wrapper = styled(Card)`
  padding-bottom: calc(var(--base-common-padding) * 4);
  padding-top: calc(var(--base-common-padding) * 3);
  width: 540px;
`

const ErrorMessage = styled.p``

const Tokens: React.FC<HTMLAttributes<HTMLDivElement>> = ({ ...restProps }) => {
  const retry = useCallback<Required<WithSuspenseAndRetryProps>['fallbackRender']>(
    ({ resetErrorBoundary }) => (
      <div>
        <Button onClick={resetErrorBoundary}>again!</Button>
      </div>
    ),
    [],
  )

  return (
    <Wrapper {...restProps}>
      <TokensMainnet errorFallback={<ErrorMessage>oh no! 🙀</ErrorMessage>} />

      {/* <TokenListWrapper>
        <TokensArbitrum suspenseFallback="loading arbitrum tokens..." />
      </TokenListWrapper>
      <TokenListWrapper>
        <TokensPolygon
          fallbackRender={retry}
          searchPlaceholder="find it!"
        />
      </TokenListWrapper> */}
    </Wrapper>
  )
}

export default Tokens
