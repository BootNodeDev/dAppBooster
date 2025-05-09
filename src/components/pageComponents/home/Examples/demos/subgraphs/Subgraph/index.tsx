import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import Arbitrum from '@/src/components/pageComponents/home/Examples/demos/assets/Arbitrum'
import Base from '@/src/components/pageComponents/home/Examples/demos/assets/Base'
import Optimism from '@/src/components/pageComponents/home/Examples/demos/assets/Optimism'
import Polygon from '@/src/components/pageComponents/home/Examples/demos/assets/Polygon'
import Icon from '@/src/components/pageComponents/home/Examples/demos/subgraphs/Subgraph/Icon'
import CopyButton from '@/src/components/sharedComponents/ui/CopyButton'
import ExternalLink from '@/src/components/sharedComponents/ui/ExternalLink'
import { toaster } from '@/src/components/ui/toaster'
import { env } from '@/src/env'
import { allAaveReservesQueryDocument } from '@/src/subgraphs/queries/aave/reserves'
import { allUniswapPoolsQueryDocument } from '@/src/subgraphs/queries/uniswap/pools'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'
import { generateSchemasMapping } from '@bootnodedev/db-subgraph'
import { Box, Flex, Heading, Skeleton, Span } from '@chakra-ui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
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
      <Arbitrum
        height="20px"
        width="20px"
      />
    )}
    {chainName === 'polygon' && (
      <Polygon
        height="20px"
        width="20px"
      />
    )}
    {chainName === 'op mainnet' && (
      <Optimism
        height="20px"
        width="20px"
      />
    )}
    {chainName === 'base' && (
      <Base
        height="20px"
        width="20px"
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
    <Flex
      counterReset="item-number"
      flexDirection="column"
      padding={{ base: '0 px', lg: 0 }}
      rowGap={4}
    >
      <Heading
        alignItems="center"
        as="h3"
        color="var(--theme-subgraph-title-color)"
        columnGap={2}
        display="flex"
        fontFamily="{fonts.body}"
        fontSize="16px"
        fontWeight="700"
        lineHeight="1.2"
        margin="0"
        paddingBottom={2}
        title={chain.name}
      >
        Uniswap Pool {getNetworkIcon(chain.name.toLowerCase())}
      </Heading>
      {data.map((position) => (
        <Flex
          alignItems="center"
          color="var(--theme-subgraph-name-color)"
          columnGap={2}
          display="flex"
          _before={{
            '--base-size': '18px',
            alignItems: 'center',
            backgroundColor: 'var(--theme-subgraph-bullet-background-color)',
            borderRadius: '50%',
            color: 'var(--theme-subgraph-bullet-color)',
            content: 'counter(item-number, decimal-leading-zero)',
            counterIncrement: 'item-number',
            display: 'flex',
            flexShrink: '0',
            fontSize: '10px',
            fontWeight: '700',
            height: 'var(--base-size)',
            justifyContent: 'center',
            letterSpacing: '-1px',
            lineHeight: '18px',
            paddingRight: '1px',
            width: 'var(--base-size)',
          }}
          key={position.id}
        >
          <Span>{position.pool.symbol}</Span>
          <Copy value={position.pool.id} />
          <ExternalLink
            href={`${baseUrl}${position.pool.id}`}
            aria-label="Explore"
          />
        </Flex>
      ))}
    </Flex>
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
    <Flex
      counterReset="item-number"
      flexDirection="column"
      padding={{ base: '0 px', lg: 0 }}
      rowGap={4}
    >
      <Heading
        alignItems="center"
        as="h3"
        color="var(--theme-subgraph-title-color)"
        columnGap={2}
        display="flex"
        fontFamily="{fonts.body}"
        fontSize="16px"
        fontWeight="700"
        lineHeight="1.2"
        margin="0"
        paddingBottom={2}
        title={base.name}
      >
        AAVE Reserves
        {getNetworkIcon(base.name.toLowerCase())}
      </Heading>
      {data.map(({ id, name, underlyingAsset }) => (
        <Flex
          alignItems="center"
          color="var(--theme-subgraph-name-color)"
          columnGap={2}
          display="flex"
          _before={{
            '--base-size': '18px',
            alignItems: 'center',
            backgroundColor: 'var(--theme-subgraph-bullet-background-color)',
            borderRadius: '50%',
            color: 'var(--theme-subgraph-bullet-color)',
            content: 'counter(item-number, decimal-leading-zero)',
            counterIncrement: 'item-number',
            display: 'flex',
            flexShrink: '0',
            fontSize: '10px',
            fontWeight: '700',
            height: 'var(--base-size)',
            justifyContent: 'center',
            letterSpacing: '-1px',
            lineHeight: '1',
            paddingRight: '1px',
            width: 'var(--base-size)',
          }}
          key={id}
        >
          <Box
            fontSize="16px"
            fontWeight="400"
            lineHeight="1.2"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {name}
          </Box>
          <Copy value={underlyingAsset} />
          <ExternalLink
            href={`${baseUrl}${underlyingAsset}`}
            aria-label="Explore"
          />
        </Flex>
      ))}
    </Flex>
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
          '--theme-subgraph-title-color': '#2e3048',
          '--theme-subgraph-name-color': '#2e3048',
          '--theme-subgraph-bullet-color': '#f7f7f7',
          '--theme-subgraph-bullet-background-color': '#2e3048',
        },
        '.dark &': {
          '--theme-subgraph-title-color': '#fff',
          '--theme-subgraph-name-color': '#fff',
          '--theme-subgraph-bullet-color': '#2e3048',
          '--theme-subgraph-bullet-background-color': '#fff',
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
  sourceCodeHref:
    'https://github.com/BootNodeDev/dAppBooster/blob/dac8165b48832fae2fda82ad5e334f972e187d10/src/components/pageComponents/home/Examples/demos/SubgraphDemo/List.tsx#L249',
  demo: <Subgraph />,
  href: 'https://docs.dappbooster.dev/plugins/subgraphs',
  icon: <Icon />,
  text: 'Connect to subgraphs and fetch data from the blockchain the easy way.',
  title: 'Subgraphs',
}

export default subgraph
