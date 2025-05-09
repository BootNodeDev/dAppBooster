import OptionsDropdown from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import Icon from '@/src/components/pageComponents/home/Examples/demos/TokenInput/Icon'
import Arbitrum from '@/src/components/pageComponents/home/Examples/demos/assets/Arbitrum'
import Eth from '@/src/components/pageComponents/home/Examples/demos/assets/Eth'
import Optimism from '@/src/components/pageComponents/home/Examples/demos/assets/Optimism'
import Polygon from '@/src/components/pageComponents/home/Examples/demos/assets/Polygon'
import BaseTokenInput from '@/src/components/sharedComponents/TokenInput'
import { useTokenInput } from '@/src/components/sharedComponents/TokenInput/useTokenInput'
import type { Networks } from '@/src/components/sharedComponents/TokenSelect/types'
import { useTokenLists } from '@/src/hooks/useTokenLists'
import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'
import { Box, Flex, Skeleton } from '@chakra-ui/react'
import { useState } from 'react'
import { arbitrum, mainnet, optimism, polygon } from 'viem/chains'

type Options = 'single' | 'multi'

const SkeletonLoadingTokenInput = () => (
  <Flex
    flexDirection="column"
    height="144px"
    padding={4}
    rowGap={2}
    width="100%"
  >
    <Skeleton
      height="17px"
      minHeight="0"
      width="80px"
    />
    <Skeleton
      borderRadius="8px"
      minHeight="58px"
      width="100%"
    />
    <Skeleton
      borderRadius="8px"
      minHeight="18px"
      width="100%"
    />
  </Flex>
)

/**
 * Select multi-token or single-token mode
 */
const TokenInputMode = withSuspenseAndRetry(
  ({ currentTokenInput }: { currentTokenInput: Options }) => {
    const { isWalletConnected } = useWeb3Status()
    const [currentNetworkId, setCurrentNetworkId] = useState<number>()
    const { tokensByChainId } = useTokenLists()
    const { searchResult } = useTokenSearch({
      tokens: tokensByChainId[1],
      defaultSearchTerm: 'WETH',
    })
    const tokenInputMulti = useTokenInput()
    const tokenInputSingle = useTokenInput(searchResult[0])

    const networks: Networks = [
      {
        icon: <Eth />,
        id: mainnet.id,
        label: mainnet.name,
        onClick: () => setCurrentNetworkId(mainnet.id),
      },
      {
        icon: <Optimism />,
        id: optimism.id,
        label: optimism.name,
        onClick: () => setCurrentNetworkId(optimism.id),
      },
      {
        icon: <Arbitrum />,
        id: arbitrum.id,
        label: arbitrum.name,
        onClick: () => setCurrentNetworkId(arbitrum.id),
      },
      {
        icon: <Polygon />,
        id: polygon.id,
        label: polygon.name,
        onClick: () => setCurrentNetworkId(polygon.id),
      },
    ]

    return (
      <BaseTokenInput
        currentNetworkId={currentNetworkId}
        networks={networks}
        showAddTokenButton
        showBalance={isWalletConnected}
        showTopTokens
        singleToken={currentTokenInput === 'single'}
        title="You pay"
        tokenInput={currentTokenInput === 'multi' ? tokenInputMulti : tokenInputSingle}
      />
    )
  },
)

/**
 * This demo uses the TokenInput component to show how to use it in a single
 * token or multi token mode.
 */
const TokenInput = () => {
  const [currentTokenInput, setCurrentTokenInput] = useState<Options>('single')
  const dropdownItems = [
    { label: 'Single token', onClick: () => setCurrentTokenInput('single') },
    { label: 'Multi token', onClick: () => setCurrentTokenInput('multi') },
  ]

  return (
    <Box
      paddingTop={{ base: 2, lg: 6 }}
      width="100%"
    >
      <OptionsDropdown
        items={dropdownItems}
        currentItem={dropdownItems[0].label}
      />
      <TokenInputMode
        currentTokenInput={currentTokenInput}
        suspenseFallback={<SkeletonLoadingTokenInput />}
      />
    </Box>
  )
}

const tokenInput = {
  demo: <TokenInput />,
  href: 'https://bootnodedev.github.io/dAppBooster/variables/components_sharedComponents_TokenInput.TokenInput.html',
  icon: <Icon />,
  text: (
    <>
      <a
        href="https://bootnodedev.github.io/dAppBooster/variables/components_sharedComponents_TokenSelect.TokenSelect.html"
        rel="noreferrer"
        target="_blank"
      >
        Select a token
      </a>{' '}
      or specify one beforehand, enter a token amount, auto detect token decimals, user balance, min
      and max boundaries, format numbers, max button.
    </>
  ),
  title: 'Token input',
}

export default tokenInput
