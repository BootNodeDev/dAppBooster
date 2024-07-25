import { arbitrum, base, type Chain, optimism, polygon } from 'viem/chains'

import { useSubgraphIndexingStatus } from '@/src/hooks/useSubgraphIndexingStatus'
import SubgraphStatus from '@/src/sharedComponents/SubgraphStatus'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const Uniswap = withSuspenseAndRetry(({ chain }: { chain: Chain }) => {
  const indexingStatus = useSubgraphIndexingStatus({ chain, resource: 'uniswap' })

  return <SubgraphStatus indexingStatus={indexingStatus} />
})

const Aave = withSuspenseAndRetry(() => {
  const indexingStatus = useSubgraphIndexingStatus({ chain: base, resource: 'aave' })

  return <SubgraphStatus indexingStatus={indexingStatus} />
})

const uniswapNetworks = [optimism, polygon, arbitrum]

const List = () => {
  return (
    <>
      {uniswapNetworks.map((chain) => (
        <Uniswap chain={chain} key={chain.id} />
      ))}
      <Aave />
    </>
  )
}

export default List
