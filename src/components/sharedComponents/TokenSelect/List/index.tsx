import { type HTMLAttributes, type FC } from 'react'
import styled from 'styled-components'

import Row from '@/src/components/sharedComponents/TokenSelect/List/Row'
import VirtualizedList from '@/src/components/sharedComponents/TokenSelect/List/VirtualizedList'
import { type Token, type Tokens } from '@/src/types/token'

const Wrapper = styled.div.attrs(({ className = 'tokenSelectList' }) => ({ className }))`
  --theme-token-select-list-border-top-color-default: var(
    --theme-token-select-list-border-top-color,
    #e2e0e7
  );

  border-top: 1px solid var(--theme-token-select-list-border-top-color-default);
`

const NoTokens = styled.div`
  --base-token-no-items-row-padding: calc(var(--base-common-padding) * 3) 0 0 0;
  --theme-token-select-row-background-color-default: var(
    --theme-token-select-row-background-color,
    transparent
  );

  align-items: center;
  background-color: var(--theme-token-select-row-background-color-default);
  display: flex;
  justify-content: center;
  padding: var(--base-token-no-items-row-padding);
  transition: background-color var(--base-transition-duration-sm) ease-in-out;
  width: 100%;
`

interface TokenSelectListProps extends HTMLAttributes<HTMLDivElement> {
  showAddTokenButton?: boolean
  containerHeight: number
  iconSize: number
  itemHeight: number
  onTokenSelect: (token: Token | undefined) => void
  showBalance: boolean
  isLoadingBalances: boolean
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
  // style,
  tokenList,
  ...restProps
}) => {
  return (
    <Wrapper className={`${className ? className : ''}`.trim()}>
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
