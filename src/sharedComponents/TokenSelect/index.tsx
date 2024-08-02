import { useEffect, useRef, useState, type HTMLAttributes, type ReactElement } from 'react'
import styled from 'styled-components'

import { type ChainId } from '@lifi/sdk'
import { Card, Spinner } from 'db-ui-toolkit'

import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import { useTokens } from '@/src/hooks/useTokens'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { chains, ChainsIds } from '@/src/lib/networks.config'
import List from '@/src/sharedComponents/TokenSelect/List'
import Search from '@/src/sharedComponents/TokenSelect/Search'
import TopTokens from '@/src/sharedComponents/TokenSelect/TopTokens'
import { type Token } from '@/src/types/token'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

export type Networks = Array<{
  icon: ReactElement
  id: number
  label: string
  onClick: () => void
}>

const Wrapper = styled(Card).attrs(({ className = 'tokenSelectWrapper' }) => {
  return { className }
})`
  --base-card-padding: calc(var(--base-common-padding) * 5) 0 calc(var(--base-common-padding) * 3);
  --base-token-select-horizontal-padding: var(--base-common-padding-xl, 16px);
  --theme-token-select-title-color-default: var(--theme-token-select-title-color, #2e3048);

  background-color: var(--theme-token-select-background-color, var(--theme-card-background-color));
  border-color: var(--theme-token-select-border-color, var(--theme-card-border-color));
  box-shadow: var(--theme-token-select-background-color, var(--theme-card-box-shadow));
  display: flex;
  flex-direction: column;
  max-width: 100%;
  row-gap: calc(var(--base-gap) * 3);
  width: 540px;
`

const Title = styled.h2.attrs(({ className = 'tokenSelectTitle' }) => {
  return { className }
})`
  color: var(--theme-token-select-title-color-default);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  padding: 0 var(--base-token-select-horizontal-padding);
`

const LoadingText = styled.span.attrs(({ className = 'tokenSelectLoadingText' }) => {
  return { className }
})`
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.5;
  opacity: 0.8;
  text-align: center;
`

/** @ignore */
export const Loading = styled(Wrapper).attrs(() => {
  return {
    className: `tokenSelectLoading`,
    children: (
      <>
        <Spinner />
        <LoadingText>Loading tokens...</LoadingText>
      </>
    ),
  }
})`
  align-items: center;
  justify-content: center;
  min-height: 450px;
  row-gap: calc(var(--base-gap) * 2);
`

export interface TokenSelectProps extends HTMLAttributes<HTMLDivElement> {
  containerHeight?: number
  currentNetworkId?: number
  iconSize?: number
  itemHeight?: number
  networks?: Networks | undefined
  onTokenSelect: (token: Token | undefined) => void
  placeholder?: string
  showAddTokenButton?: boolean
  showTopTokens?: boolean
  showBalance?: boolean
}

/**
 * TokenSelect component, used to search and select a token from a list.
 *
 * @param {object} props - TokenSelect props.
 * @param {number} [props.currentNetworkId=mainnet.id] - The current network id. Default is mainnet's id.
 * @param {function} props.onTokenSelect - Callback function to be called when a token is selected.
 * @param {Networks} [props.networks] - Optional list of networks to display in the dropdown. The dropdown won't show up if undefined. Default is undefined.
 * @param {string} [props.placeholder='Search by name or address'] - Optional placeholder text for the search input. Default is 'Search by name or address'.
 * @param {number} [props.containerHeight=320] - Optional height of the virtualized tokens list. Default is 320.
 * @param {number} [props.iconSize=32] - Optional size of the token icon in the list. Default is 32.
 * @param {number} [props.itemHeight=64] - Optional height of each item in the list. Default is 64.
 * @param {boolean} [props.showAddTokenButton=false] - Optional flag to allow adding a token. Default is false.
 * @param {boolean} [props.showBalance=false] - Optional flag to show the token balance in the list. Default is false.
 * @param {boolean} [props.showTopTokens=false] - Optional flag to show the top tokens in the list. Default is false.
 *
 * @remarks
 * Individual CSS classes are available for deep styling of individual components within TokenSelect:
 *
 * Also theme CSS vars are available for cosmetic changes:
 *
 * Title:
 * * --theme-token-select-title-color
 *
 * Main container:
 * * --theme-token-select-background-color (defaults to --theme-card-background-color)
 * * --theme-token-select-border-color (defaults to --theme-card-border-color)
 * * --theme-token-select-box-shadow (defaults to --theme-card-box-shadow)
 *
 * Search field:
 * * --theme-token-select-search-field-color
 * * --theme-token-select-search-field-color-active
 * * --theme-token-select-search-field-background-color
 * * --theme-token-select-search-field-background-color-active
 * * --theme-token-select-search-field-placeholder-color
 * * --theme-token-select-search-field-box-shadow
 * * --theme-token-select-search-field-box-shadow-active
 * * --theme-token-select-search-field-border-color
 * * --theme-token-select-search-field-border-color-active
 *
 * Network select button:
 * * --theme-token-select-network-button-color
 * * --theme-token-select-network-button-color-hover
 * * --theme-token-select-network-button-background-color
 * * --theme-token-select-network-button-background-color-hover
 *
 * Top tokens:
 * * --theme-token-select-top-token-item-color
 * * --theme-token-select-top-token-item-color-hover
 * * --theme-token-select-top-token-item-background-color
 * * --theme-token-select-top-token-item-background-color-hover
 * * --theme-token-select-top-token-item-border-color
 * * --theme-token-select-top-token-item-border-color-hover
 *
 * List:
 * * --theme-token-select-list-border-top-color
 *
 * List item:
 * * --theme-token-select-row-background-color
 * * --theme-token-select-row-background-color-hover
 * * --theme-token-select-row-token-name-color
 * * --theme-token-select-row-token-name-color-hover
 * * --theme-token-select-row-token-balance-color
 * * --theme-token-select-row-token-balance-color-hover
 * * --theme-token-select-row-token-value-color
 * * --theme-token-select-row-token-value-color-hover
 */
const TokenSelect = withSuspenseAndRetry<TokenSelectProps>(
  ({
    children,
    containerHeight = 320,
    currentNetworkId,
    iconSize = 32,
    itemHeight = 64,
    networks = undefined,
    onTokenSelect,
    placeholder = 'Search by name or address',
    showAddTokenButton = false,
    showBalance = false,
    showTopTokens = false,
    ...restProps
  }) => {
    const { appChainId, walletChainId } = useWeb3Status()

    const [chainId, setChainId] = useState<ChainId>(() =>
      getValidChainId({
        appChainId,
        currentNetworkId,
        dappChains: chains,
        networks,
        walletChainId,
      }),
    )

    const previousDepsRef = useRef([appChainId, currentNetworkId, walletChainId])

    /**
     * This is a sort-of observer, that listens to changes in the `appChainId` and `currentNetworkId`
     *  identifies which one changed and updates the chainId accordingly.
     *
     * This way, we can have a mixed behavior between app-based and wallet-based chain change.
     */
    useEffect(() => {
      const previousDeps = previousDepsRef.current
      const currentDeps = [appChainId, currentNetworkId, walletChainId]

      previousDeps.forEach((previousDep, index) => {
        const currentDep = currentDeps[index]

        if (previousDep !== currentDep) {
          if (index === 1) {
            // currentNetworkId changed, we stick with it
            setChainId(currentDeps[1] as ChainId)
          } else {
            // appChainId or walletChainId changed,
            //  we need to check that it's valid in the current context
            if (networks) {
              // if `networks` is defined,
              //  we need to check if the chainId is valid in the list and set it
              if (networks.some((network) => network.id === currentDep)) {
                setChainId(currentDep as ChainId)
              }
            } else {
              // if `networks` is not defined,
              //  we need to check if the chainId is valid in the dApp chains list and set it
              if (chains.some((chain) => chain.id === currentDep)) {
                setChainId(currentDep as ChainId)
              }
            }
          }
        }
      })

      previousDepsRef.current = [appChainId, currentNetworkId, walletChainId]
    }, [appChainId, currentNetworkId, networks, walletChainId])

    const { isLoadingBalances, tokensByChainId } = useTokens({
      chainId: chainId as ChainId,
      withBalance: showBalance,
    })

    const { searchResult, searchTerm, setSearchTerm } = useTokenSearch(tokensByChainId[chainId], [
      currentNetworkId,
      tokensByChainId,
    ])

    return (
      <Wrapper {...restProps}>
        <Title>Select a token</Title>
        <Search
          currentNetworkId={chainId}
          networks={networks}
          placeholder={placeholder}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        {showTopTokens && (
          <TopTokens onTokenSelect={onTokenSelect} tokens={tokensByChainId[chainId]} />
        )}
        <List
          containerHeight={containerHeight}
          iconSize={iconSize}
          isLoadingBalances={isLoadingBalances}
          itemHeight={itemHeight}
          onTokenSelect={onTokenSelect}
          showAddTokenButton={showAddTokenButton && walletChainId === chainId}
          showBalance={showBalance}
          tokenList={searchResult}
        />
        {children}
      </Wrapper>
    )
  },
)

function getValidChainId({
  appChainId,
  currentNetworkId,
  dappChains,
  networks,
  walletChainId,
}: {
  currentNetworkId?: ChainId
  networks?: Networks
  dappChains: typeof chains
  walletChainId?: ChainId
  appChainId?: ChainsIds
}) {
  // If the current network is defined, use it
  if (currentNetworkId) {
    return currentNetworkId
  }

  // if `networks` has been passed, then we need to stick with
  if (networks !== undefined) {
    // we prioritze the wallet chainId over the app chainId because it may be valid in this case,
    //  but not supported by the app to interact with but as a read-only chain.
    if (networks.some((network) => network.id === walletChainId)) {
      return walletChainId as ChainId
    }

    if (networks.some((network) => network.id === appChainId)) {
      return appChainId as ChainId
    }

    // if nothing matches, we default to the first network in the list
    return networks[0].id
  }

  // if `networks` is not defined, we need to verify the dApp configuration
  // Same as before, we prioritize the wallet chainId over the app chainId
  if (dappChains.some((chain) => chain.id === walletChainId)) {
    return walletChainId as ChainId
  }

  if (dappChains.some((chain) => chain.id === appChainId)) {
    return appChainId as ChainId
  }

  // if nothing matches, we default to the first chain in the list
  return dappChains[0].id
}

export default TokenSelect
