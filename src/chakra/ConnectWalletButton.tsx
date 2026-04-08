import type { FC } from 'react'
import { ConnectWalletButton as HeadlessConnectWalletButton } from '@/src/sdk/react/components/ConnectWalletButton'
import type { UseWalletOptions } from '@/src/sdk/react/hooks/useWallet'
import ConnectButton from '@/src/wallet/components/ConnectButton'

/**
 * Chakra-styled connect/account button.
 *
 * Composes the headless ConnectWalletButton with the Chakra ConnectButton
 * for styled rendering.
 */
export const ConnectWalletButton: FC<UseWalletOptions & { label?: string }> = ({
  label = 'Connect',
  ...walletOptions
}) => {
  return (
    <HeadlessConnectWalletButton
      {...walletOptions}
      render={({ status, truncatedAddress, onConnect, onManageAccount }) => (
        <ConnectButton
          isConnected={status.connected}
          onClick={status.connected ? onManageAccount : onConnect}
        >
          {status.connected && truncatedAddress ? truncatedAddress : label}
        </ConnectButton>
      )}
    />
  )
}
