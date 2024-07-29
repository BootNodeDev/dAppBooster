import { type ElementType, type FC, type MouseEventHandler, ComponentProps } from 'react'
import styled from 'styled-components'

import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { type Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

const Wrapper = styled.button``

type WrapperType = ComponentProps<'button'>

interface Props extends WrapperType {
  $token: Token
  as?: ElementType
}

/**
 * @name AddERC20TokenButton
 * @description Renders a button that adds an ERC20 token to the wallet.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Token} props.$token - The ERC20 token object.
 * @returns {JSX.Element} The rendered AddERC20TokenButton component.
 */
const AddERC20TokenButton: FC<Props> = ({ $token, children, onClick, ...restProps }) => {
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
