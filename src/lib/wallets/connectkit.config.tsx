import React from 'react'

import { getDefaultConfig, ConnectKitProvider, ConnectKitButton, Types } from 'connectkit'
import { Address } from 'viem'
import { normalize } from 'viem/ens'
import { createConfig, useEnsName, useEnsAvatar } from 'wagmi'

import { env } from '@/src/env'
import { chains, transports } from '@/src/lib/networks.config'
import Avatar from '@/src/sharedComponents/Avatar'
import ConnectButton from '@/src/sharedComponents/ConnectButton'

const UserAvatar: React.FC<{
  address: Address
  size: number
}> = ({ address, size }) => {
  const { data: ensName } = useEnsName({ address })

  const { data: avatarImg } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
  })

  return <Avatar address={address} ensImage={avatarImg} ensName={ensName} size={size} />
}

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConnectKitProvider
      options={{
        customAvatar: Avatar as React.FC<Types.CustomAvatarProps>,
      }}
    >
      {children}
    </ConnectKitProvider>
  )
}

export const ConnectWalletButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ address, isConnected, isConnecting, show, truncatedAddress }) => {
        return (
          <ConnectButton $isConnected={isConnected} disabled={isConnecting} onClick={show}>
            {isConnected ? (
              <>
                {address && <UserAvatar address={address} size={24} />}
                {truncatedAddress}
              </>
            ) : (
              'Connect'
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

export const config = createConfig(connectkitConfig)
