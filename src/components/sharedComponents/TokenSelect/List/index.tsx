import type { ComponentProps, FC } from 'react'
import styled from 'styled-components'

import Row from '@/src/components/sharedComponents/TokenSelect/List/Row'
import VirtualizedList from '@/src/components/sharedComponents/TokenSelect/List/VirtualizedList'
import type { Token, Tokens } from '@/src/types/token'

const Wrapper = styled.div.attrs<{ $containerHeight?: number }>(
  ({ className = 'tokenSelectList' }) => ({
    className,
  }),
)`
  border-top: 1px solid var(--theme-token-select-list-border-top-color, #e2e0e7);
  display: flex;
  min-height: ${({ $containerHeight }) => `${$containerHeight}px`};
  width: 100%;
`

const NoTokens = styled.div`
  align-items: center;
  background-color: var(--theme-token-select-row-background-color, transparent);
  display: flex;
  justify-content: center;
  padding: var(--base-common-padding-xl, 16px);
  transition: background-color var(--base-transition-duration-sm, 0.2s) ease-in-out;
  width: 100%;
`

interface TokenSelectListProps extends ComponentProps<'div'> {
  containerHeight: number
  iconSize: number
  isLoadingBalances: boolean
  itemHeight: number
  onTokenSelect: (token: Token | undefined) => void
  showAddTokenButton?: boolean
  showBalance: boolean
  tokenList?: Tokens
}

/**
 * List component for TokenSelect. Displays a list of tokens.
 *
 * @param {object} props - TokenSelect List props.
 * @param {number} props.containerHeight - The height of the virtualized list container.
 * @param {number} props.iconSize - The size of the token icon for each item in the list.
 * @param {number} props.itemHeight - The height of each item in the list.
 * @param {function} props.onTokenSelect - Callback function to be called when a token is selected.
 * @param {boolean} props.showAddTokenButton - Whether to display an add token button.
 * @param {boolean} props.showBalance - Flag to show the token balance in the list.
 * @param {boolean} props.isLoadingBalances - Flag to inform the balances are loading.
 * @param {Tokens} props.tokenList - The list of tokens to display.
 */
const List: FC<TokenSelectListProps> = ({
  className,
  containerHeight,
  iconSize,
  isLoadingBalances,
  itemHeight,
  onTokenSelect,
  showAddTokenButton,
  showBalance,
  tokenList,
  ...restProps
}) => {
  return (
    <Wrapper
      $containerHeight={containerHeight}
      className={`${className ? className : ''}`.trim()}
    >
      {tokenList?.length ? (
        <VirtualizedList<Token>
          containerHeight={containerHeight}
          itemHeight={itemHeight}
          items={tokenList}
          renderItem={(token) => (
            <Row
              iconSize={iconSize}
              isLoadingBalances={isLoadingBalances}
              key={token.address}
              onClick={(token) => onTokenSelect(token)}
              showAddTokenButton={showAddTokenButton}
              showBalance={showBalance}
              token={token}
            />
          )}
          {...restProps}
        />
      ) : (
        <NoTokens>Nothing to show</NoTokens>
      )}
    </Wrapper>
  )
}

export default List
