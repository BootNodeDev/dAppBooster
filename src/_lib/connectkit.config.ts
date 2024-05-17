import { getDefaultConfig, ConnectKitProvider, ConnectKitButton } from 'connectkit'
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, optimismSepolia } from 'wagmi/chains'

import { env } from '@/src/env'

export const WalletProvider = ConnectKitProvider

export const ConnectWalletButton = ConnectKitButton

const defaultConfig = {
  chains: [mainnet, sepolia, optimismSepolia],
  transports: {
    [mainnet.id]: http(
      env.PUBLIC_ALCHEMY_ID
        ? `https://eth-mainnet.g.alchemy.com/v2/${env.PUBLIC_ALCHEMY_ID}`
        : undefined,
    ),
    [optimismSepolia.id]: http('https://sepolia.optimism.io'),
  },

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
