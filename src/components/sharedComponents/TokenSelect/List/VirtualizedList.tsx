import { Box } from '@chakra-ui/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { type ReactNode, useRef } from 'react'

type VirtualizedListProps<Item> = {
  containerHeight: number
  itemHeight: number
  items: Array<Item>
  renderItem: (item: Item) => ReactNode
}

const VirtualizedList = <Item,>({
  containerHeight,
  itemHeight,
  items,
  renderItem,
  ...restProps
}: VirtualizedListProps<Item>) => {
  const parentRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    estimateSize: () => itemHeight,
    getScrollElement: () => parentRef.current,
    overscan: 5,
  })

  return (
    <Box
      maxHeight={`${containerHeight}px`}
      overflow="auto"
      ref={parentRef}
      width="100%"
      {...restProps}
    >
      <Box
        height={`${rowVirtualizer.getTotalSize()}px`}
        position="relative"
        width="100%"
      >
        {rowVirtualizer.getVirtualItems().map(({ index, key, size, start }) => (
          <Box
            height={`${size}px`}
            key={key}
            left="0"
            position="absolute"
            top="0"
            transform={`translateY(${start}px)`}
            width="100%"
          >
            {renderItem(items[index])}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default VirtualizedList
