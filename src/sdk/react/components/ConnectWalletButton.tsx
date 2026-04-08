import type { FC, ReactElement } from 'react'
import type { WalletStatus } from '../../core/adapters/wallet'
import type { UseWalletOptions } from '../hooks/useWallet'
import { useWallet } from '../hooks/useWallet'

/** Props passed to the render prop of ConnectWalletButton. */
export interface ConnectWalletButtonRenderProps {
  status: WalletStatus
  truncatedAddress: string | undefined
  onConnect: () => void
  onManageAccount: () => void
}

interface ConnectWalletButtonProps extends UseWalletOptions {
  render: (props: ConnectWalletButtonRenderProps) => ReactElement
}

/**
 * Headless connect/account button that works with any connector.
 *
 * Resolves the wallet adapter via `useWallet(options)` and delegates all
 * rendering to the `render` prop. In a multi-wallet setup, pass `chainType`
 * or `chainId` to target a specific adapter's modal.
 */
export const ConnectWalletButton: FC<ConnectWalletButtonProps> = ({ render, ...walletOptions }) => {
  const { status, openConnectModal, openAccountModal } = useWallet(walletOptions)

  const address = status.activeAccount
  const truncatedAddress = address ? `${address.slice(0, 6)}\u2026${address.slice(-4)}` : undefined

  return render({
    status,
    truncatedAddress,
    onConnect: openConnectModal,
    onManageAccount: openAccountModal,
  })
}
