import List from '@/src/components/sharedComponents/TokenSelect/List'
import Search from '@/src/components/sharedComponents/TokenSelect/Search'
import TopTokens from '@/src/components/sharedComponents/TokenSelect/TopTokens'
import type { Networks } from '@/src/components/sharedComponents/TokenSelect/types'
import { getValidChainId } from '@/src/components/sharedComponents/TokenSelect/utils'
import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import { useTokens } from '@/src/hooks/useTokens'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { chains } from '@/src/lib/networks.config'
import type { Token } from '@/src/types/token'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'
import { Flex, type FlexProps } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import type { Chain } from 'viem/chains'
import styles from './styles'

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
type Props = FlexProps & TokenSelectProps

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
 */
const TokenSelect = withSuspenseAndRetry<Props>(
  ({
    children,
    containerHeight = 320,
    currentNetworkId,
    css,
    iconSize = 32,
    itemHeight = 52,
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
      <Flex
        backgroundColor="var(--background-color)"
        borderRadius="8px"
        border="1px solid var(--border-color)"
        boxShadow="var(--box-shadow)"
        css={{
          ...css,
          ...styles,
        }}
        flexDirection="column"
        maxWidth="calc(100vw - 16px)"
        paddingTop={4}
        paddingBottom={0}
        paddingX={0}
        rowGap={4}
        width="540px"
        overflow="hidden"
        {...restProps}
      >
        <Search
          currentNetworkId={chainId}
          disabled={!tokensByChainId[chainId]?.length}
          networks={networks}
          placeholder={placeholder}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        {showTopTokens && (
          <TopTokens
            onTokenSelect={onTokenSelect}
            tokens={tokensByChainId[chainId]}
          />
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
      </Flex>
    )
  },
)

export default TokenSelect
