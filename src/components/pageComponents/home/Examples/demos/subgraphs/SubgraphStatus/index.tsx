import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import { getNetworkIcon } from '@/src/components/pageComponents/home/Examples/demos/subgraphs/Subgraph'
import Icon from '@/src/components/pageComponents/home/Examples/demos/subgraphs/SubgraphStatus/Icon'
import { env } from '@/src/env'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'
import { type SchemaMappingConfig, useSubgraphIndexingStatus } from '@bootnodedev/db-subgraph'
import { Flex, Grid, Heading, Skeleton, Span } from '@chakra-ui/react'
import { type FC, useState } from 'react'
import { type Chain, arbitrum, base, optimism, polygon } from 'viem/chains'

export const SkeletonLoadingItem = () => (
  <Flex
    bgColor="var(--theme-subgraph-status-background)"
    borderRadius="4px"
    flexDirection="column"
    padding={4}
    rowGap={4}
    width="100%"
  >
    <Skeleton
      minHeight="20px"
      width="40%"
    />
    <Skeleton
      minHeight="19px"
      width="100%"
    />
  </Flex>
)

const Status: FC<{
  indexingStatus: ReturnType<typeof useSubgraphIndexingStatus>
}> = ({ indexingStatus }) => {
  const { chain, isSynced, networkBlockNumber, resource, subgraphBlockNumber } = indexingStatus

  return (
    <Flex
      bgColor="var(--theme-subgraph-status-background)"
      borderRadius="4px"
      flexDirection="column"
      padding={4}
      rowGap={4}
      width="100%"
    >
      <Heading
        alignItems="center"
        as="h3"
        color="var(--theme-subgraph-title-color)"
        columnGap={2}
        display="flex"
        fontSize="16px"
        fontWeight="700"
        lineHeight="1.2"
        margin="0"
        title={chain.name}
      >
        {`${resource}@${chain.id}`}
        {getNetworkIcon(chain.name.toLowerCase())}
      </Heading>
      <Grid
        css={{
          '--base-status-size': '10px',
        }}
        alignItems="center"
        color="var(--theme-subgraph-status-data-row-color)"
        columnGap={2}
        display="grid"
        fontSize="16px"
        fontWeight="400"
        gridTemplateColumns={{
          base: 'var(--base-status-size) 1fr',
          lg: 'var(--base-status-size) auto 10px auto',
        }}
        lineHeight="1.2"
        maxWidth="100%"
        whiteSpace="nowrap"
        width="fit-content"
        _before={{
          alignItems: 'center',
          backgroundColor: `${!isSynced ? '{colors.danger.default}' : '{colors.ok.default}'}`,
          borderRadius: '50%',
          content: "''",
          display: 'flex',
          height: 'var(--base-status-size)',
          width: 'var(--base-status-size)',
          transition: 'background-color var({durations.slow})',
        }}
      >
        <Span>
          <b>SG:</b> {subgraphBlockNumber.toString()}
        </Span>
        <Span display={{ base: 'none', lg: 'block' }}>-</Span>
        <Span paddingLeft={{ base: 'calc(var(--base-status-size) + 8px)', lg: 0 }}>
          <b>BC:</b>
          {networkBlockNumber?.toString() ?? '-'}
        </Span>
      </Grid>
    </Flex>
  )
}

// define the schema configuration for the current implementation and needs
const schemaConfig: SchemaMappingConfig = {
  apiKey: env.PUBLIC_SUBGRAPHS_API_KEY,
  chainsResourceIds: env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS,
  environment: env.PUBLIC_SUBGRAPHS_ENVIRONMENT,
  productionUrl: env.PUBLIC_SUBGRAPHS_PRODUCTION_URL,
}

const Uniswap = withSuspenseAndRetry(({ chain }: { chain: Chain }) => {
  const indexingStatus = useSubgraphIndexingStatus({
    chain,
    resource: 'uniswap',
    schemaConfig,
  })

  return <Status indexingStatus={indexingStatus} />
})

const Aave = withSuspenseAndRetry(() => {
  const indexingStatus = useSubgraphIndexingStatus({
    chain: base,
    resource: 'aave',
    schemaConfig,
  })

  return <Status indexingStatus={indexingStatus} />
})

const uniswapNetworks = [optimism, polygon, arbitrum]

const SubgraphStatus = ({ ...restProps }) => {
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
          '--theme-subgraph-status-background': '#fff',
          '--theme-subgraph-status-data-row-color': '#2e3048',
          '--theme-subgraph-status-data-color': '#5f6178',
        },
        '.dark &': {
          '--theme-subgraph-status-background': '#373954',
          '--theme-subgraph-status-data-row-color': '#fff',
          '--theme-subgraph-status-data-color': '#e2e0e7',
        },
      }}
      display="flex"
      flexDirection="column"
      paddingBottom={0}
      paddingTop={{ base: 2, lg: 6 }}
      paddingX={0}
      rowGap={4}
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

const subgraphStatus = {
  sourceCodeHref:
    'https://github.com/BootNodeDev/dAppBooster/blob/dac8165b48832fae2fda82ad5e334f972e187d10/src/components/pageComponents/home/Examples/demos/SubgraphStatusDemo/List.tsx#L178',
  demo: <SubgraphStatus />,
  href: 'https://docs.dappbooster.dev/plugins/subgraphs',
  icon: <Icon />,
  text: "Easily check a subgraph's syncing status.",
  title: 'Subgraph status',
}

export default subgraphStatus
