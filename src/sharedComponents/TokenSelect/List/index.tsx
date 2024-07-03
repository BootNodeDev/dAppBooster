import { HTMLAttributes } from 'react'
import styled from 'styled-components'

import Row from '@/src/sharedComponents/TokenSelect/List/Row'
import VirtualizedList from '@/src/sharedComponents/VirtualizedList'
import { type Token, type Tokens } from '@/src/types/token'
import { withSuspense } from '@/src/utils/suspenseWrapper'

const Wrapper = styled.div.attrs(({ className = 'tokenSelectList' }) => ({ className }))`
  [data-theme='light'] & {
    --theme-token-select-list-border-color: #e2e0e7;
  }

  [data-theme='dark'] & {
    --theme-token-select-list-border-color: #4b4d60;
  }

  border-top: 1px solid var(--theme-token-select-list-border-color);
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  containerHeight: number
  iconSize: number
  itemHeight: number
  onTokenSelect: (token: Token | undefined) => void
  showBalance?: boolean
  showValue?: boolean
  tokenList: Tokens
}

const List = withSuspense(
  ({
    className,
    containerHeight,
    iconSize,
    itemHeight,
    onTokenSelect,
    showBalance,
    showValue,
    style,
    tokenList,
    ...restProps
  }: Props) => {
    return (
      <Wrapper className={`${className ? className : ''}`.trim()} style={style}>
        <VirtualizedList<Token>
          containerHeight={containerHeight}
          itemHeight={itemHeight}
          items={tokenList}
          renderItem={(item) => (
            <Row
              iconSize={iconSize}
              onClick={(token) => onTokenSelect(token)}
              showBalance={showBalance}
              showValue={showValue}
              token={item}
            />
          )}
          {...restProps}
        />
      </Wrapper>
    )
  },
)

export default List
