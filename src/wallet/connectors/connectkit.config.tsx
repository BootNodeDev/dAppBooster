import type { ButtonProps } from '@chakra-ui/react'
import { ConnectKitButton, ConnectKitProvider, getDefaultConfig, type Types } from 'connectkit'
import type { FC, ReactNode } from 'react'
import type { Address } from 'viem'
import { normalize } from 'viem/ens'
import { createConfig, useEnsAvatar, useEnsName } from 'wagmi'
import { Avatar } from '@/src/core/components'
import { chains, transports } from '@/src/core/types'
import { env } from '@/src/env'
import ConnectButton from '../components/ConnectButton'

interface Props {
  address: Address
  size: number
}

const UserAvatar: FC<Props> = ({ address, size }: Props) => {
  const { data: ensName } = useEnsName({ address })

  const { data: avatarImg } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
  })

  return (
    <Avatar
      address={address}
      ensImage={avatarImg}
      ensName={ensName}
      size={size}
    />
  )
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

export const ConnectWalletButton = ({
  label = 'Connect',
  ...restProps
}: { label?: string } & ButtonProps) => {
  return (
    <ConnectKitButton.Custom>
      {({ address, isConnected, isConnecting, show, truncatedAddress }) => {
        return (
          <ConnectButton
            disabled={isConnecting}
            isConnected={isConnected}
            onClick={show}
            {...restProps}
          >
            {isConnected ? (
              <>
                {address && (
                  <UserAvatar
                    address={address}
                    size={24}
                  />
                )}
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

export const config = createConfig(connectkitConfig)
