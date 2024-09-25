import { type ComponentPropsWithoutRef, type FC, type MouseEventHandler } from 'react'
import styled from 'styled-components'

import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { type Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

const Wrapper = styled.button.attrs(({ className = 'tokenSelectAddERC20TokenButton' }) => {
  return { className }
})`
  align-items: center;
  background-color: var(--theme-token-select-add-erc20-token-button-background-color, #2e3048);
  border-radius: var(--base-border-radius-sm, 4px);
  border: 1px solid var(--theme-token-select-add-erc20-token-button-border-color, #2e3048);
  color: var(--theme-token-select-add-erc20-token-button-color, #fff);
  cursor: pointer;
  display: flex;
  font-family: var(--base-font-family, sans-serif);
  font-size: 1.1rem;
  font-weight: 500;
  height: 21px;
  line-height: 1;
  outline: none;
  padding: 0 var(--base-common-padding, 8px);
  user-select: none;
  white-space: nowrap;

  &:hover {
    background-color: var(
      --theme-token-select-add-erc20-token-button-background-color-hover,
      var(--theme-token-select-add-erc20-token-button-background-color, #2e3048)
    );
    border-color: var(
      --theme-token-select-add-erc20-token-button-border-color-hover,
      var(--theme-token-select-add-erc20-token-button-border-color, #2e3048)
    );
    color: var(
      --theme-token-select-add-erc20-token-button-color-hover,
      var(--theme-token-select-add-erc20-token-button-color, #fff)
    );
  }
`

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
    <Wrapper disabled={disabled} onClick={handleClick} {...restProps}>
      {children}
    </Wrapper>
  )
}

export default AddERC20TokenButton
