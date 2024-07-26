import { type HTMLAttributes, type FC } from 'react'
import styled from 'styled-components'

import Row from '@/src/sharedComponents/TokenSelect/List/Row'
import VirtualizedList from '@/src/sharedComponents/VirtualizedList'
import { type Token, type Tokens } from '@/src/types/token'

const Wrapper = styled.div.attrs(({ className = 'tokenSelectList' }) => ({ className }))`
  --theme-token-select-list-border-top-color-default: var(
    --theme-token-select-list-border-top-color,
    #e2e0e7
  );

  border-top: 1px solid var(--theme-token-select-list-border-top-color-default);
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  showAddTokenButton?: boolean
  containerHeight: number
  iconSize: number
  itemHeight: number
  onTokenSelect: (token: Token | undefined) => void
  showBalance: boolean
  isLoadingBalances: boolean
  tokenList: Tokens
}

/**
 * @name List
 * @description List component for TokenSelect. Displays a list of tokens.
 *
 * @param {number} containerHeight - The height of the virtualized list container.
 * @param {number} iconSize - The size of the token icon for each item in the list.
 * @param {number} itemHeight - The height of each item in the list.
 * @param {function} onTokenSelect - Callback function to be called when a token is selected.
 * @param {boolean} showAddTokenButton - Whether to display an add token button.
 * @param {boolean} showBalance - Flag to show the token balance in the list.
 * @param {boolean} isLoadingBalances - Flag to inform the balances are loading.
 * @param {Tokens} tokenList - The list of tokens to display.
 */
const List: FC<Props> = ({
  className,
  containerHeight,
  iconSize,
  isLoadingBalances,
  itemHeight,
  onTokenSelect,
  showAddTokenButton,
  showBalance,
  style,
  tokenList,
  ...restProps
}) => {
  return (
    <Wrapper className={`${className ? className : ''}`.trim()} style={style}>
      <VirtualizedList<Token>
        containerHeight={containerHeight}
        itemHeight={itemHeight}
        items={tokenList}
        renderItem={(item) => (
          <Row
            iconSize={iconSize}
            isLoadingBalances={isLoadingBalances}
            onClick={(token) => onTokenSelect(token)}
            showAddTokenButton={showAddTokenButton}
            showBalance={showBalance}
            token={item}
          />
        )}
        {...restProps}
      />
    </Wrapper>
  )
}

export default List
