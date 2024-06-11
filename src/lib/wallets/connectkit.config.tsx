import { getDefaultConfig, ConnectKitProvider, ConnectKitButton, Types } from 'connectkit'
import { createConfig } from 'wagmi'

import { env } from '@/src/env'
import { chains, transports } from '@/src/lib/networks.config'
import CustomAvatar from '@/src/sharedComponents/ui/Avatar'
import ConnectButton from '@/src/sharedComponents/ui/ConnectButton'

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConnectKitProvider
      options={{
        customAvatar: CustomAvatar as React.FC<Types.CustomAvatarProps>,
      }}
    >
      {children}
    </ConnectKitProvider>
  )
}

export const ConnectWalletButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, truncatedAddress }) => {
        return (
          <ConnectButton disabled={isConnecting} onClick={show}>
            {isConnected ? truncatedAddress : 'Connect'}
          </ConnectButton>
        )
      }}
    </ConnectKitButton.Custom>
  )
}

const defaultConfig = {
  chains,
  transports,

  // Required API Keys
  walletConnectProjectId: env.PUBLIC_WALLETCONNECT_PROJECT_ID,

  // Required App Info
  appName: env.PUBLIC_APP_NAME,

  // Optional App Info
  appDescription: env.PUBLIC_APP_DESCRIPTION,
  appUrl: env.PUBLIC_APP_URL,
  appIcon: env.PUBLIC_APP_LOGO,
} as const

const connectkitConfig = getDefaultConfig(defaultConfig)

export const config = createConfig(connectkitConfig)
