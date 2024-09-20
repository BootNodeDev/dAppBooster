import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import styled from 'styled-components'

import { type Chain } from 'viem/chains'

import List from '@/src/components/sharedComponents/TokenSelect/List'
import Search from '@/src/components/sharedComponents/TokenSelect/Search'
import TopTokens from '@/src/components/sharedComponents/TokenSelect/TopTokens'
import type { Networks } from '@/src/components/sharedComponents/TokenSelect/types'
import { getValidChainId } from '@/src/components/sharedComponents/TokenSelect/utils'
import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import { useTokens } from '@/src/hooks/useTokens'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { chains } from '@/src/lib/networks.config'
import { type Token } from '@/src/types/token'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const Wrapper = styled.div.attrs(({ className = 'tokenSelectWrapper' }) => {
  return { className }
})`
  background-color: var(--theme-token-select-background-color, #fff);
  border-radius: var(--base-border-radius, 8px);
  border: 1px solid var(--theme-token-select-border-color, #fff);
  box-shadow: var(--theme-token-select-background-color, 0 9.6px 13px 0 rgb(0 0 0 / 8%));
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - var(--base-gap-xl, 16px));
  padding: calc(var(--base-common-padding, 8px) * 5) 0 calc(var(--base-common-padding, 8px) * 3);
  row-gap: calc(var(--base-gap, 8px) * 3);
  width: 540px;
`

const Title = styled.h2.attrs(({ className = 'tokenSelectTitle' }) => {
  return { className }
})`
  color: var(--theme-token-select-title-color, #2e3048);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  padding: 0 var(--base-common-padding-xl, 16px);
`

export interface TokenSelectProps {
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

/** @ignore */
type Props = ComponentPropsWithoutRef<'div'> & TokenSelectProps

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
const TokenSelect = withSuspenseAndRetry<Props>(
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

    const [chainId, setChainId] = useState<Chain['id']>(() =>
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
          const currentChainId = currentDeps[1]

          if (index === 1 && !!currentChainId) {
            // currentNetworkId changed, we stick with it
            setChainId(currentChainId)
          } else {
            if (!currentDep) {
              // if the chainId is undefined, we don't do anything
              return
            }

            // appChainId or walletChainId changed,
            //  we need to check that it's valid in the current context
            if (networks) {
              // if `networks` is defined,
              //  we need to check if the chainId is valid in the list and set it
              if (networks.some((network) => network.id === currentDep)) {
                setChainId(currentDep)
              }
            } else {
              // if `networks` is not defined,
              //  we need to check if the chainId is valid in the dApp chains list and set it
              if (chains.some((chain) => chain.id === currentDep)) {
                setChainId(currentDep)
              }
            }
          }
        }
      })

      previousDepsRef.current = [appChainId, currentNetworkId, walletChainId]
    }, [appChainId, currentNetworkId, networks, walletChainId])

    const { isLoadingBalances, tokensByChainId } = useTokens({
      chainId,
      withBalance: showBalance,
    })

    const { searchResult, searchTerm, setSearchTerm } = useTokenSearch(
      { tokens: tokensByChainId[chainId] },
      [currentNetworkId, tokensByChainId[chainId]],
    )

    return (
      <Wrapper {...restProps}>
        <Title>Select a token</Title>
        <Search
          currentNetworkId={chainId}
          disabled={!tokensByChainId[chainId]?.length}
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

export default TokenSelect
