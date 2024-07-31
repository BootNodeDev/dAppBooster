import { type ElementType, type FC, type MouseEventHandler, ComponentProps } from 'react'
import styled from 'styled-components'

import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { type Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

const Wrapper = styled.button``

interface AddERC20TokenButtonProps extends ComponentProps<'button'> {
  $token: Token
  as?: ElementType
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
    <Wrapper disabled={disabled} onClick={handleClick} type="button" {...restProps}>
      {children}
    </Wrapper>
  )
}

export default AddERC20TokenButton
