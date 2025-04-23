import { Card as BaseCard, type CardRootProps } from '@chakra-ui/react'
import type { FC } from 'react'

export const Card: FC<CardRootProps> = ({ ...restProps }) => (
  <BaseCard.Root
    backgroundColor="var(--theme-card-background-color)"
    borderColor="var(--theme-card-border-color)"
    boxShadow="var(--theme-card-box-shadow)"
    borderRadius="md"
    display="flex"
    flexDirection="column"
    padding={4}
    {...restProps}
  />
)

export default Card
