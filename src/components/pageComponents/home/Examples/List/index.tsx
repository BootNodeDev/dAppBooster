import Item, { type Props as ItemProps } from '@/src/components/pageComponents/home/Examples/Item'
import { Grid, type GridProps } from '@chakra-ui/react'
import type { FC } from 'react'
import styles from './styles'

interface Props extends GridProps {
  items: ItemProps[]
}

const List: FC<Props> = ({ css, items, ...restProps }) => {
  return (
    <Grid
      minWidth="0"
      gap={6}
      templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }}
      w="100%"
      css={{
        ...styles,
        ...css,
      }}
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
