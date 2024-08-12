import { type FC, type ReactNode } from 'react'

import { getDefaultConfig, ConnectKitProvider, ConnectKitButton, type Types } from 'connectkit'
import { type Address } from 'viem'
import { normalize } from 'viem/ens'
import { createConfig, useEnsName, useEnsAvatar } from 'wagmi'

import Avatar from '@/src/components/sharedComponents/Avatar'
import ConnectButton from '@/src/components/sharedComponents/ConnectButton'
import { env } from '@/src/env'
import { chains, transports } from '@/src/lib/networks.config'

interface Props {
  address: Address
  size: number
}

const UserAvatar: FC<Props> = ({ address, size }: Props) => {
  const { data: ensName } = useEnsName({ address })

  const { data: avatarImg } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
  })

  return <Avatar address={address} ensImage={avatarImg} ensName={ensName} size={size} />
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ConnectKitProvider
      options={{
        customAvatar: Avatar as FC<Types.CustomAvatarProps>,
        initialChainId: 0,
        enforceSupportedChains: false,
      }}
    >
      {children}
    </ConnectKitProvider>
  )
}

export const ConnectWalletButton = ({ label = 'Connect', ...restProps }: { label?: string }) => {
  return (
    <ConnectKitButton.Custom>
      {({ address, isConnected, isConnecting, show, truncatedAddress }) => {
        return (
          <ConnectButton
            $isConnected={isConnected}
            disabled={isConnecting}
            onClick={show}
            {...restProps}
          >
            {isConnected ? (
              <>
                {address && <UserAvatar address={address} size={24} />}
                {truncatedAddress}
              </>
            ) : (
              label
            )}
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

// eslint-disable-next-line react-refresh/only-export-components
export const config = createConfig(connectkitConfig)
