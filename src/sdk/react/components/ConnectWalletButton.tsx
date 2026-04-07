import type { FC } from 'react'
import ConnectButton from '@/src/wallet/components/ConnectButton'
import type { UseWalletOptions } from '../hooks/useWallet'
import { useWallet } from '../hooks/useWallet'

/**
 * Styled connect/account button that works with any connector.
 *
 * Resolves the wallet adapter via `useWallet(options)` and opens the
 * adapter-specific connect modal. In a multi-wallet setup, pass `chainType`
 * or `chainId` to target a specific adapter's modal.
 */
export const ConnectWalletButton: FC<UseWalletOptions & { label?: string }> = ({
  label = 'Connect',
  ...walletOptions
}) => {
  const { status, openConnectModal, openAccountModal } = useWallet(walletOptions)

  const address = status.activeAccount
  const truncatedAddress = address ? `${address.slice(0, 6)}\u2026${address.slice(-4)}` : undefined

  return (
    <ConnectButton
      isConnected={status.connected}
      onClick={status.connected ? openAccountModal : openConnectModal}
    >
      {status.connected && truncatedAddress ? truncatedAddress : label}
    </ConnectButton>
  )
}
