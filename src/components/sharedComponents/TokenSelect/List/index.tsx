import Row from '@/src/components/sharedComponents/TokenSelect/List/Row'
import VirtualizedList from '@/src/components/sharedComponents/TokenSelect/List/VirtualizedList'
import type { Token, Tokens } from '@/src/types/token'
import { Flex, type FlexProps } from '@chakra-ui/react'
import type { FC } from 'react'

interface TokenSelectListProps extends FlexProps {
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
    <Flex
      borderTop="1px solid var(--list-border-top-color)"
      className={`${className ? className : ''}`.trim()}
      width="100%"
      flexGrow={1}
      overflow="hidden"
      alignItems="stretch"
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
        <Flex
          alignItems="center"
          backgroundColor="var(--row-background-color)"
          justifyContent="center"
          padding={4}
          transition="background-color {durations.moderate} ease-in-out"
          width="100%"
        >
          No tokens
        </Flex>
      )}
    </Flex>
  )
}

export default List
