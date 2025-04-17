import { useState } from 'react'
import styled, { css } from 'styled-components'

import { Item, SkeletonLoading, breakpointMediaQuery } from '@bootnodedev/db-ui-toolkit'
import { arbitrum, mainnet, optimism, polygon } from 'viem/chains'

import { OptionsButton } from '@/src/components/pageComponents/home/Examples/demos/OptionsButton'
import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import Arbitrum from '@/src/components/pageComponents/home/Examples/demos/assets/Arbitrum'
import Eth from '@/src/components/pageComponents/home/Examples/demos/assets/Eth'
import Optimism from '@/src/components/pageComponents/home/Examples/demos/assets/Optimism'
import Polygon from '@/src/components/pageComponents/home/Examples/demos/assets/Polygon'
import TokenInput from '@/src/components/sharedComponents/TokenInput'
import { useTokenInput } from '@/src/components/sharedComponents/TokenInput/useTokenInput'
import type { Networks } from '@/src/components/sharedComponents/TokenSelect/types'
import { useTokenLists } from '@/src/hooks/useTokenLists'
import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const Wrapper = styled.div`
  padding-top: var(--base-common-padding);
  width: 100%;

  ${breakpointMediaQuery(
    'desktopStart',
    css`
      padding-top: calc(var(--base-common-padding) * 3);
    `,
  )}
`

type Options = 'single' | 'multi'

const SkeletonLoadingTokenInput = () => (
  <SkeletonLoading
    $animate={false}
    style={{
      height: '144px',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      rowGap: '8px',
      width: '100%',
    }}
  >
    <SkeletonLoading style={{ width: '80px', minHeight: '0', height: '17px' }} />
    <SkeletonLoading style={{ width: '100%', minHeight: '58px', borderRadius: '8px' }} />
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
      <>
        {currentTokenInput === 'multi' && (
          <TokenInput
            currentNetworkId={currentNetworkId}
            networks={networks}
            showAddTokenButton
            showBalance={isWalletConnected}
            showTopTokens
            title="You pay"
            tokenInput={tokenInputMulti}
          />
        )}
        {currentTokenInput === 'single' && (
          <TokenInput
            currentNetworkId={currentNetworkId}
            networks={networks}
            showAddTokenButton
            showBalance={isWalletConnected}
            showTopTokens
            singleToken
            title="You pay"
            tokenInput={tokenInputSingle}
          />
        )}
      </>
    )
  },
)

/**
 * This demo uses the TokenInput component to show how to use it in a single
 * token or multi token mode.
 */
const TokenInputDemo = () => {
  const dropdownItems = [
    { label: 'Single token', type: 'single' },
    { label: 'Multi token', type: 'multi' },
  ]
  const [currentTokenInput, setCurrentTokenInput] = useState<Options>('single')

  return (
    <Wrapper>
      <OptionsDropdown
        button={
          <OptionsButton>
            {dropdownItems.find((item) => item.type === currentTokenInput)?.label}
          </OptionsButton>
        }
        defaultActiveItem={0}
        items={dropdownItems.map((item) => (
          <Item
            key={`${item.type}`}
            onClick={() => setCurrentTokenInput(item.type as Options)}
          >
            {item.label}
          </Item>
        ))}
      />
      <TokenInputs
        currentTokenInput={currentTokenInput}
        suspenseFallback={<SkeletonLoadingTokenInput />}
      />
    </Wrapper>
  )
}

export default TokenInputDemo
