import Item, { type Props as ItemProps } from '@/src/components/pageComponents/home/Examples/Item'
import { Grid, type GridProps } from '@chakra-ui/react'
import type { FC } from 'react'

interface Props extends GridProps {
  items: ItemProps[]
}

const List: FC<Props> = ({ items, ...restProps }) => {
  return (
    <Grid
      minWidth="0"
      gap={6}
      templateColumns={{ base: '1fr', lg: '1fr 1fr', xl: '1fr 1fr 1fr' }}
      w="100%"
      {...restProps}
    >
      {items.map((item) => (
        <Item
          key={item.title}
          {...item}
        />
      ))}
    </Grid>
  )
}

export default List
