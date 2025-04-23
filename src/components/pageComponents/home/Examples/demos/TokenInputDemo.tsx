import OptionsDropdown from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import Arbitrum from '@/src/components/pageComponents/home/Examples/demos/assets/Arbitrum'
import Eth from '@/src/components/pageComponents/home/Examples/demos/assets/Eth'
import Optimism from '@/src/components/pageComponents/home/Examples/demos/assets/Optimism'
import Polygon from '@/src/components/pageComponents/home/Examples/demos/assets/Polygon'
import TokenInput from '@/src/components/sharedComponents/TokenInput'
import { useTokenInput } from '@/src/components/sharedComponents/TokenInput/useTokenInput'
import type { Networks } from '@/src/components/sharedComponents/TokenSelect/types'
import SkeletonLoading from '@/src/components/sharedComponents/ui/SkeletonLoading'
import { useTokenLists } from '@/src/hooks/useTokenLists'
import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'
import { Box } from '@chakra-ui/react'
import { useState } from 'react'
import { arbitrum, mainnet, optimism, polygon } from 'viem/chains'

type Options = 'single' | 'multi'

const SkeletonLoadingTokenInput = () => (
  <SkeletonLoading
    $animate={false}
    display="flex"
    flexDirection="column"
    height="144px"
    padding="16px"
    rowGap="8px"
    width="100%"
  >
    <SkeletonLoading
      height="17px"
      minHeight="0"
      width="80px"
    />
    <SkeletonLoading
      borderRadius="8px"
      minHeight="58px"
      width="100%"
    />
  </SkeletonLoading>
)

const TokenInputs = withSuspenseAndRetry(
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
      <TokenInput
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
const TokenInputDemo = () => {
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
      <TokenInputs
        currentTokenInput={currentTokenInput}
        suspenseFallback={<SkeletonLoadingTokenInput />}
      />
    </Box>
  )
}

export default TokenInputDemo
