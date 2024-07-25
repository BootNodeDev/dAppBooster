import { lazy } from 'react'
import styled from 'styled-components'

import { isSubgraphConfigValid } from '@/src/constants/common'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const List = lazy(() => import('./List'))

const Wrapper = styled.p`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`

const SubgraphLoader = withSuspenseAndRetry(() => {
  return isSubgraphConfigValid ? (
    <List />
  ) : (
    <Wrapper>
      Be sure to have properly configured the{' '}
      <a
        href="https://github.com/bootnodedev/dAppBooster#subgraphs"
        rel="noreferrer"
        target="_blank"
      >
        Subgraph env variables
      </a>
    </Wrapper>
  )
})

export default SubgraphLoader
