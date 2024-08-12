import { lazy } from 'react'

import { Text } from 'db-ui-toolkit'

import { PrimaryButton } from '@/src/components/sharedComponents/Buttons'
import { isSubgraphConfigValid } from '@/src/constants/common'

const List = lazy(() => import('./List'))

const SubgraphDemo = () => {
  return isSubgraphConfigValid ? (
    <List />
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
}

export default SubgraphDemo
