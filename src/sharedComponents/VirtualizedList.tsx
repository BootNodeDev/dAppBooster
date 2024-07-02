import { type ReactNode, useRef } from 'react'
import styled from 'styled-components'

import { useVirtualizer } from '@tanstack/react-virtual'

const Wrapper = styled.div<{ $containerHeight: number }>`
  height: ${(props) => `${props.$containerHeight}px`};
  overflow: auto;
`

const Items = styled.div<{ $totalSize: number }>`
  height: ${(props) => `${props.$totalSize}px`};
  position: relative;
  width: 100%;
`

const VisibleItems = styled.div<{ height: number; start: number }>`
  height: ${(props) => `${props.height}px`};
  left: 0;
  position: absolute;
  top: 0;
  transform: ${(props) => `translateY(${props.start}px)`};
`

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
    <Wrapper $containerHeight={containerHeight} ref={parentRef} {...restProps}>
      <Items $totalSize={rowVirtualizer.getTotalSize()}>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <VisibleItems height={virtualItem.size} key={virtualItem.key} start={virtualItem.start}>
            {renderItem(items[virtualItem.index])}
          </VisibleItems>
        ))}
      </Items>
    </Wrapper>
  )
}

export default VirtualizedList