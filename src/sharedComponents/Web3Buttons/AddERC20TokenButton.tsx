import { type FC } from 'react'
import styled from 'styled-components'

import { Button as BaseButton } from 'db-ui-toolkit'

import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { type Token } from '@/src/types/token'
import { isNativeToken } from '@/src/utils/address'

const Button = styled(BaseButton)`
  border: none;
  border-radius: 50%;
  font-size: 1.6em;
  height: 32px;
  width: 32px;

  /** it works on my machine */
  padding-bottom: 0.1em;

  &:hover {
    background-color: var(--theme-copy-button-color-hover);
    color: var(--theme-button-secondary-color-hover);
  }
`

/**
 * Renders a button to add an ERC20 token to the wallet.
 *
 *
 * @param {Object} props - The component props.
 * @param {Token} props.token - The ERC20 token object.
 * @returns {JSX.Element} The rendered AddERC20TokenButton component.
 */
export const AddERC20TokenButton: FC<{ token: Token }> = ({ token }) => {
  const { isWalletConnected, walletChainId, walletClient } = useWeb3Status()

  if (isNativeToken(token.address)) {
    return null
  }

  const disabled = !isWalletConnected || walletChainId !== token.chainId

  return (
    <Button
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()

        walletClient?.watchAsset({
          options: {
            address: token.address,
            decimals: token.decimals,
            symbol: token.symbol,
            image: token.logoURI,
          },
          type: 'ERC20',
        })
      }}
    >
      &oplus;
    </Button>
  )
}

export default AddERC20TokenButton
