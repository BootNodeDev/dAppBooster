import { Flex, type FlexProps, Skeleton } from '@chakra-ui/react'
import type { FC } from 'react'

/**
 * Skeleton placeholder for token balance and USD value, shown while data is loading.
 */
const BalanceLoading: FC<FlexProps> = ({ ...restProps }) => (
  <Flex
    alignItems="flex-end"
    display="flex"
    flexDirection="column"
    rowGap={1}
    {...restProps}
  >
    <Skeleton
      height="19px"
      width="50px"
    />
    <Skeleton
      height="14px"
      width="50px"
    />
  </Flex>
)

export default BalanceLoading
