import Item, { type Props as ItemProps } from '@/src/components/pageComponents/home/Examples/Item'
import { Flex, Heading } from '@chakra-ui/react'
import type { FC, HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  items: ItemProps[]
}

const List: FC<Props> = ({ items, ...restProps }) => {
  return (
    <Flex
      css={{
        '.light &': {
          '--theme-examples-list-background-color': '#e2e0e766',
        },
        '.dark &': {
          '--theme-examples-list-background-color': '#292b43',
        },
      }}
      align="center"
      bg="var(--theme-examples-list-background-color)"
      borderRadius="xl"
      direction="column"
      maxW="100%"
      p={{ base: '32px 8px', lg: '56px' }}
      rowGap={{ base: '32px', lg: '40px' }}
      w="1066px"
      {...restProps}
    >
      <Heading
        color="var(--theme-text-color)"
        fontFamily="var(--base-font-family)"
        fontSize={{ base: '21px', lg: '36px' }}
        fontWeight="700"
        lineHeight="1.2"
        m="0"
      >
        Built-in Features
      </Heading>
      <Flex
        direction="column"
        maxW="100%"
        rowGap={4}
        w="100%"
      >
        {items.map((item) => (
          <Item
            key={item.title}
            {...item}
          />
        ))}
      </Flex>
    </Flex>
  )
}

export default List
