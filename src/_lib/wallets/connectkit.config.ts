import { getDefaultConfig, ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { createConfig } from 'wagmi'

import { chains, transports } from '@/src/_lib/networks.config'
import { env } from '@/src/env'

export const WalletProvider = ConnectKitProvider

export const ConnectWalletButton = ConnectKitButton

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
