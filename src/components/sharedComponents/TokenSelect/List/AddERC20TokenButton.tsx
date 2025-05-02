import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import type { Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'
import { chakra } from '@chakra-ui/react'
import type { ComponentPropsWithoutRef, FC, MouseEventHandler } from 'react'

interface AddERC20TokenButtonProps extends ComponentPropsWithoutRef<'button'> {
  $token: Token
}

/**
 * Renders a button that adds an ERC20 token to the wallet.
 *
 * @param {AddERC20TokenButtonProps} props - AddERC20TokenButton component props.
 * @param {Token} props.$token - The ERC20 token object.
 */
const AddERC20TokenButton: FC<AddERC20TokenButtonProps> = ({
  $token,
  children,
  onClick,
  ...restProps
}) => {
  const { isWalletConnected, walletChainId, walletClient } = useWeb3Status()
  const { address, chainId, decimals, logoURI, symbol } = $token
  const disabled = !isWalletConnected || walletChainId !== chainId

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()

    walletClient?.watchAsset({
      options: {
        address: address,
        decimals: decimals,
        image: logoURI,
        symbol: symbol,
      },
      type: 'ERC20',
    })

    onClick?.(e)
  }

  return isNativeToken(address) ? null : (
    <chakra.button
      alignItems="center"
      backgroundColor="var(--add-erc20-token-button-background-color)"
      border="1px solid var(--add-erc20-token-button-border-color)"
      borderRadius={1}
      color="var(--add-erc20-token-button-color)"
      cursor="pointer"
      display="flex"
      fontFamily="{fonts.body}"
      fontSize="11px"
      fontWeight="500"
      height="21px"
      lineHeight={1}
      outline="none"
      paddingX={2}
      paddingY="0"
      userSelect="none"
      whiteSpace="nowrap"
      _hover={{
        backgroundColor:
          'var(--add-erc20-token-button-background-color-hover, var(--add-erc20-token-button-background-color))',
        borderColor:
          'var(--add-erc20-token-button-border-color-hover, var(--add-erc20-token-button-border-color))',
        color: 'var(--add-erc20-token-button-color-hover, var(--add-erc20-token-button-color))',
      }}
      disabled={disabled}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </chakra.button>
  )
}

export default AddERC20TokenButton
