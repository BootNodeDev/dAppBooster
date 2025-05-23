import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import {
  Row,
  RowActions,
  RowName,
  RowTitle,
  Title,
  Wrapper,
} from '@/src/components/pageComponents/home/Examples/demos/subgraphs/Subgraph/Components'
import Icon from '@/src/components/pageComponents/home/Examples/demos/subgraphs/Subgraph/Icon'
import CopyButton from '@/src/components/sharedComponents/ui/CopyButton'
import ExternalLink from '@/src/components/sharedComponents/ui/ExternalLink'
import { toaster } from '@/src/components/ui/toaster'
import { env } from '@/src/env'
import { allAaveReservesQueryDocument } from '@/src/subgraphs/queries/aave/reserves'
import { allUniswapPoolsQueryDocument } from '@/src/subgraphs/queries/uniswap/pools'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'
import { generateSchemasMapping } from '@bootnodedev/db-subgraph'
import { Box, Flex, Skeleton } from '@chakra-ui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { NetworkArbitrumOne, NetworkBase, NetworkOptimism, NetworkPolygon } from '@web3icons/react'
import request from 'graphql-request'
import { useState } from 'react'
import { type Chain, arbitrum, base, optimism, polygon } from 'viem/chains'

const chainNameMapping: { [key: number]: string } = {
  [arbitrum.id]: 'arbitrum',
  [optimism.id]: 'optimism',
  [polygon.id]: 'polygon',
}

const Copy = ({ value }: { value: string }) => {
  const handleCopy = () => {
    const timeDelay = 2500
    toaster.create({
      duration: timeDelay,
      type: 'success',
      id: 'copy-to-clipboard',
      description: 'Copied to the clipboard!',
    })
  }

  return (
    <CopyButton
      onClick={handleCopy}
      value={value}
      aria-label="Copy"
    />
  )
}

export const getNetworkIcon = (chainName: string) => (
  <>
    {chainName === 'arbitrum one' && (
      <NetworkArbitrumOne
        size={20}
        variant="background"
      />
    )}
    {chainName === 'polygon' && (
      <NetworkPolygon
        size={20}
        variant="background"
      />
    )}
    {chainName === 'op mainnet' && (
      <NetworkOptimism
        size={20}
        variant="background"
      />
    )}
    {chainName === 'base' && (
      <NetworkBase
        size={20}
        variant="background"
      />
    )}
  </>
)

export const SkeletonLoadingItem = () => (
  <Flex
    flexDirection="column"
    height="auto"
    minHeight="133px"
    rowGap="9px"
    width="100%"
  >
    <Skeleton
      height="28px"
      paddingBottom={4}
      width="40%"
    />
    <Skeleton
      height="16px"
      width="100%"
    />
    <Skeleton
      height="16px"
      width="100%"
    />
    <Skeleton
      height="16px"
      width="100%"
    />
    <Skeleton
      height="16px"
      width="100%"
    />
  </Flex>
)

const appSchemas = generateSchemasMapping({
  // biome-ignore lint/style/noNonNullAssertion: somebody else's code
  apiKey: env.PUBLIC_SUBGRAPHS_API_KEY!,
  // biome-ignore lint/style/noNonNullAssertion: somebody else's code
  chainsResourceIds: env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS!,
  environment: env.PUBLIC_SUBGRAPHS_ENVIRONMENT,
  productionUrl: env.PUBLIC_SUBGRAPHS_PRODUCTION_URL,
})

const Uniswap = withSuspenseAndRetry(({ chain }: { chain: Chain }) => {
  const { data } = useSuspenseQuery({
    queryKey: ['allUniswapPools', chain.id],
    queryFn: async () => {
      const { positions } = await request(
        appSchemas.uniswap[chain.id],
        allUniswapPoolsQueryDocument,
      )
      return positions
    },
  })

  const baseUrl = `https://app.uniswap.org/explore/pools/${chainNameMapping[chain.id]}/`

  return (
    <Wrapper>
      <Title title={chain.name}>
        Uniswap Pool{' '}
        <Box
          rounded="full"
          overflow="hidden"
        >
          {getNetworkIcon(chain.name.toLowerCase())}
        </Box>
      </Title>
      {data.map((position) => (
        <Row key={position.id}>
          <RowTitle>
            <RowName>{position.pool.symbol}</RowName>
          </RowTitle>
          <RowActions>
            <Copy value={position.pool.id} />
            <ExternalLink
              href={`${baseUrl}${position.pool.id}`}
              aria-label="Explore"
            />
          </RowActions>
        </Row>
      ))}
    </Wrapper>
  )
})

const Aave = withSuspenseAndRetry(() => {
  const { data } = useSuspenseQuery({
    queryKey: ['allAaveReserves', base.id],
    queryFn: async () => {
      const { reserves } = await request(appSchemas.aave[base.id], allAaveReservesQueryDocument)
      return reserves
    },
  })
  const baseUrl = 'https://app.aave.com/reserve-overview/?marketName=proto_base_v3&underlyingAsset='

  return (
    <Wrapper>
      <Title title={base.name}>
        AAVE Reserves
        <Box
          rounded="full"
          overflow="hidden"
        >
          {getNetworkIcon(base.name.toLowerCase())}
        </Box>
      </Title>
      {data.map(({ id, name, underlyingAsset }) => (
        <Row key={id}>
          <RowTitle>
            <RowName>{name}</RowName>
          </RowTitle>
          <RowActions>
            <Copy value={underlyingAsset} />
            <ExternalLink
              href={`${baseUrl}${underlyingAsset}`}
              aria-label="Explore"
            />
          </RowActions>
        </Row>
      ))}
    </Wrapper>
  )
})

const Subgraph = ({ ...restProps }) => {
  const uniswapNetworks = [optimism, polygon, arbitrum]
  const [currentChain, setCurrentChain] = useState<Chain | undefined>(uniswapNetworks[0])
  const chains = [...uniswapNetworks, base]

  const makeItem = (chain: Chain | undefined) => {
    return {
      label: chain?.name || '',
      onClick: () => setCurrentChain(chain),
    }
  }

  const items = chains.map((item) => makeItem(item))

  return (
    <Flex
      css={{
        '.light &': {
          '--theme-subgraph-background': '#fff',
          '--theme-subgraph-row-hover-background': '#fafafa',
          '--theme-subgraph-title-color': '#2e3048',
          '--theme-subgraph-name-color': '#2e3048',
          '--theme-subgraph-bullet-color': '#2e3048',
          '--theme-subgraph-bullet-background-color': '#e5e5e5',
        },
        '.dark &': {
          '--theme-subgraph-background': '#3a3c57',
          '--theme-subgraph-row-hover-background': '#3e405a',
          '--theme-subgraph-title-color': '#fff',
          '--theme-subgraph-name-color': '#fff',
          '--theme-subgraph-bullet-color': '#fff',
          '--theme-subgraph-bullet-background-color': '#4d506f',
        },
      }}
      flexDirection="column"
      paddingTop={{ base: 2, lg: 6 }}
      rowGap={{ base: 8, lg: 12 }}
      width="100%"
      {...restProps}
    >
      <OptionsDropdown items={items} />
      {uniswapNetworks.map(
        (chain) =>
          currentChain?.id === chain.id && (
            <Uniswap
              chain={chain}
              key={chain.id}
              suspenseFallback={<SkeletonLoadingItem />}
            />
          ),
      )}
      {currentChain?.id === base.id && <Aave suspenseFallback={<SkeletonLoadingItem />} />}
    </Flex>
  )
}

const subgraph = {
  demo: <Subgraph />,
  href: 'https://docs.dappbooster.dev/plugins/subgraphs',
  icon: <Icon />,
  text: 'Connect to subgraphs and fetch data from the blockchain the easy way.',
  title: 'Subgraphs',
}

export default subgraph
