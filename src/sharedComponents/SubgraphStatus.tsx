import { FC } from 'react'
import styled from 'styled-components'

import { useSubgraphIndexingStatus } from '@/src/hooks/useSubgraphIndexingStatus'

const Wrapper = styled.div`
  display: flex;
  width: 260px;
  justify-content: space-between;
`

const SubgraphStatus: FC<{
  indexingStatus: ReturnType<typeof useSubgraphIndexingStatus>
}> = ({ indexingStatus }) => (
  <Wrapper
    title={`${indexingStatus.resource}@${indexingStatus.chain.id} (${indexingStatus.chain.name})`}
  >
    <div>SG: {indexingStatus.subgraphBlockNumber.toString()}</div>
    <div>BC: {indexingStatus.networkBlockNumber?.toString() ?? '-'}</div>
    {indexingStatus.isSynced ? `✅` : `❌`}
  </Wrapper>
)

export default SubgraphStatus
