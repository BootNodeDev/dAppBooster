import { OptionsDropdown } from '@/src/components/pageComponents/home/Examples/demos/OptionsDropdown'
import { getNetworkIcon } from '@/src/components/pageComponents/home/Examples/demos/subgraphs/Subgraph'
import Icon from '@/src/components/pageComponents/home/Examples/demos/subgraphs/SubgraphStatus/Icon'
import { env } from '@/src/env'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'
import { type SchemaMappingConfig, useSubgraphIndexingStatus } from '@bootnodedev/db-subgraph'
import { Box, Flex, Heading, Skeleton, Span, Text } from '@chakra-ui/react'
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

  const barSize = 20
  const blocksBehind = Math.max(0, Number(networkBlockNumber) - Number(subgraphBlockNumber))
  const progress = blocksBehind >= barSize ? 0 : ((barSize - blocksBehind) / barSize) * 100

  return (
    <Flex
      backgroundColor="var(--theme-subgraph-status-background)"
      borderRadius="8px"
      padding={4}
      flexDirection="column"
      rowGap={2}
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
        paddingTop={2}
        paddingBottom={4}
        title={chain.name}
      >
        {`${resource}@${chain.id}`}
        <Box
          rounded="full"
          overflow="hidden"
        >
          {getNetworkIcon(chain.name.toLowerCase())}
        </Box>
      </Heading>
      <Flex
        alignItems="center"
        columnGap={4}
        justifyContent="space-between"
      >
        <Text fontSize="xs">{isSynced ? 'Subgraph is up to date' : 'Subgraph is syncing'}</Text>
        <Box
          fontSize="xs"
          paddingInline={2}
          lineHeight="2"
          backgroundColor="var(--theme-subgraph-status-blocks-behind-background)"
          borderRadius={8}
        >
          {networkBlockNumber - subgraphBlockNumber} blocks behind
        </Box>
      </Flex>

      <Box
        width="100%"
        backgroundColor="var(--theme-subgraph-status-blockchain-color)"
        borderRadius={6}
        overflow="hidden"
      >
        <Box
          width={`${Math.max(progress, 5)}%`}
          transition="width 0.3s"
          backgroundColor={
            !isSynced
              ? 'var(--theme-subgraph-status-subgraph-color)'
              : 'var(--theme-subgraph-status-subgraph-success-color)'
          }
          height="18px"
          borderRadius={6}
          overflow="hidden"
        />
      </Box>
      <Flex
        alignItems="center"
        columnGap={4}
        justifyContent="space-between"
        paddingTop={2}
      >
        <Flex
          flexDirection="column"
          gap={1}
          borderLeft={'1px solid '}
          borderColor={
            !isSynced
              ? 'var(--theme-subgraph-status-subgraph-color)'
              : 'var(--theme-subgraph-status-subgraph-success-color)'
          }
          paddingLeft={2}
        >
          <Heading
            as="h4"
            fontSize="13px"
            fontWeight="500"
            lineHeight="1"
          >
            Subgraph
          </Heading>
          <Span
            fontSize="12px"
            fontWeight="300"
            lineHeight="1"
          >
            {subgraphBlockNumber.toString()}
          </Span>
        </Flex>

        <Flex
          flexDirection="column"
          gap={1}
          alignItems={'flex-end'}
          borderRight={'1px solid var(--theme-subgraph-status-blockchain-color)'}
          paddingRight={2}
        >
          <Heading
            as="h4"
            fontSize="13px"
            fontWeight="500"
            lineHeight="1"
          >
            Blockchain
          </Heading>
          <Span
            fontSize="12px"
            fontWeight="300"
            lineHeight="1"
          >
            {networkBlockNumber?.toString() ?? '-'}
          </Span>
        </Flex>
      </Flex>
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
          '--theme-subgraph-status-blockchain-color': '#c2c2e5',
          '--theme-subgraph-status-subgraph-color': '#8B46A4',
          '--theme-subgraph-status-subgraph-success-color': '#29BD7F',
          '--theme-subgraph-status-blocks-behind-background': '#24263d17',
        },
        '.dark &': {
          '--theme-subgraph-status-background': '#373954',
          '--theme-subgraph-status-data-row-color': '#fff',
          '--theme-subgraph-status-data-color': '#e2e0e7',
          '--theme-subgraph-status-blockchain-color': '#131521',
          '--theme-subgraph-status-subgraph-color': '#8B46A4',
          '--theme-subgraph-status-subgraph-success-color': '#29BD7F',
          '--theme-subgraph-status-blocks-behind-background': '#24263d5c',
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
  demo: <SubgraphStatus />,
  href: 'https://docs.dappbooster.dev/plugins/subgraphs',
  icon: <Icon />,
  text: "Easily check a subgraph's syncing status.",
  title: 'Subgraph status',
}

export default subgraphStatus
