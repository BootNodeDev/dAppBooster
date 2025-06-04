import TokenLogo from '@/src/components/sharedComponents/TokenLogo'
import AddERC20TokenButton from '@/src/components/sharedComponents/TokenSelect/List/AddERC20TokenButton'
import TokenBalance from '@/src/components/sharedComponents/TokenSelect/List/TokenBalance'
import type { Token } from '@/src/types/token'
import { Box, Flex, type FlexProps, Skeleton } from '@chakra-ui/react'
import type { FC } from 'react'

const Icon: FC<{ size: number } & FlexProps> = ({ size, children, ...restProps }) => (
  <Flex
    alignItems="center"
    borderRadius="50%"
    height={`${size}px`}
    flexShrink={0}
    justifyContent="center"
    overflow="hidden"
    width={`${size}px`}
    {...restProps}
  >
    {children}
  </Flex>
)

const BalanceLoading: FC<FlexProps> = ({ ...restProps }) => (
  <Flex
    alignItems="flex-end"
    display="flex"
    flexDirection="column"
    rowGap={1}
    {...restProps}
  >
    <Skeleton
      height="19px"
      width="50px"
    />
    <Skeleton
      height="14px"
      width="50px"
    />
  </Flex>
)

interface TokenSelectRowProps extends Omit<FlexProps, 'onClick'> {
  iconSize: number
  isLoadingBalances?: boolean
  onClick: (token: Token) => void
  showAddTokenButton?: boolean
  showBalance?: boolean
  token: Token
}

/**
 * A row in the token select list.
 *
 * @param {object} props - TokenSelect List's Row props.
 * @param {Token} prop.token - The token to display.
 * @param {number} prop.iconSize - The size of the token icon.
 * @param {(token: Token) => void} prop.onClick - Callback function to be called when the row is clicked.
 * @param {boolean} prop.showAddTokenButton - Whether to display an add token button.
 * @param {boolean} [prop.showBalance=false] - Optional flag to show the token balance. Default is false.
 * @param {boolean} [prop.showBalance=false] - Optional flag to inform the balances are being loaded. Default is false.
 */
const Row: FC<TokenSelectRowProps> = ({
  iconSize,
  isLoadingBalances,
  onClick,
  showAddTokenButton,
  showBalance,
  token,
  ...restProps
}) => {
  const { name } = token

  return (
    <Flex
      alignItems="center"
      backgroundColor="var(--row-background-color)"
      columnGap={4}
      cursor="pointer"
      height="100%"
      paddingLeft={6}
      paddingRight={6}
      transition="background-color {durations.moderate} ease-in-out"
      width="100%"
      _hover={{
        backgroundColor: 'var(--row-background-color-hover)',
      }}
      _active={{
        opacity: 0.8,
      }}
      onClick={() => onClick(token)}
      {...restProps}
    >
      <Icon size={iconSize}>
        <TokenLogo
          size={iconSize}
          token={token}
        />
      </Icon>
      <Box
        color="var(--row-token-name-color)"
        fontSize="16px"
        fontWeight="500"
        lineHeight="1.2"
        _groupHover={{
          color: 'var(--row-token-name-color-hover, var(--row-token-name-color)',
        }}
      >
        {name}
      </Box>
      {showAddTokenButton && <AddERC20TokenButton $token={token}>Add token</AddERC20TokenButton>}
      {showBalance && (
        <Box marginLeft="auto">
          <TokenBalance
            isLoading={isLoadingBalances}
            suspenseFallback={<BalanceLoading />}
            token={token}
          />
        </Box>
      )}
    </Flex>
  )
}

export default Row
