import TokenLogo from '@/src/components/sharedComponents/TokenLogo'
import type { Token } from '@/src/types/token'
import { Box, Flex, chakra } from '@chakra-ui/react'
import type { ComponentPropsWithoutRef, FC } from 'react'

const ICON_SIZE = 24

interface ItemProps extends ComponentPropsWithoutRef<'button'> {
  token: Token
}

/**
 * A single token item in the top tokens list
 *
 * @param {Token} token - The token to display
 */
const Item: FC<ItemProps> = ({ token, ...restProps }) => {
  const { symbol } = token

  return (
    <chakra.button
      alignItems="center"
      backgroundColor="var(--theme-token-select-top-token-item-background-color)"
      border="1px solid var(--theme-token-select-top-token-item-border-color)"
      borderRadius={8}
      columnGap={2}
      cursor="pointer"
      display="grid"
      gridTemplateColumns={`${ICON_SIZE}px 1fr`}
      height="41px"
      paddingX={4}
      paddingY={0}
      transition="background-color var(--base-transition-duration-sm) ease-in-out"
      _hover={{
        backgroundColor: 'var(--theme-token-select-top-token-item-background-color-hover)',
        borderColor:
          'var(--theme-token-select-top-token-item-border-color-hover, var(--theme-token-select-top-token-item-border-color))',
      }}
      _active={{
        opacity: 0.8,
      }}
      role="group"
      {...restProps}
    >
      <Flex
        alignItems="center"
        borderRadius="50%"
        display="flex"
        height={`${ICON_SIZE}px`}
        justifyContent="center"
        overflow="hidden"
        width={`${ICON_SIZE}px"`}
      >
        <TokenLogo
          size={ICON_SIZE}
          token={token}
        />
      </Flex>
      <Box
        color="var(--theme-token-select-top-token-item-color)"
        fontSize="18px"
        fontWeight="500"
        lineHeight="1.2"
        _groupHover={{
          color:
            'var(--theme-token-select-top-token-item-color-hover, var(--theme-token-select-top-token-item-color)',
        }}
      >
        {symbol}
      </Box>
    </chakra.button>
  )
}

export default Item
