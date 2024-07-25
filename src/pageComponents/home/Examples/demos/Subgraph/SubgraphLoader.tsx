import { lazy } from 'react'

import { Text } from 'db-ui-toolkit'

import { isSubgraphConfigValid } from '@/src/constants/common'
import { PrimaryButton } from '@/src/sharedComponents/Buttons'
import { withSuspenseAndRetry } from '@/src/utils/suspenseWrapper'

const Subgraph = lazy(() => import('./Subgraph'))

const SubgraphLoader = withSuspenseAndRetry(() => {
  return isSubgraphConfigValid ? (
    <Subgraph />
  ) : (
    <>
      <Text>
        Remember to configure the <i>env vars</i>
      </Text>
      <PrimaryButton
        as={'a'}
        href="https://github.com/bootnodedev/dAppBooster#subgraphs"
        rel="noreferrer"
        target="_blank"
      >
        Learn How
      </PrimaryButton>
    </>
  )
})

export default SubgraphLoader
