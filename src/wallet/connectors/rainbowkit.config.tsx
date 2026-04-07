/**
 * Uncomment to use dAppBooster with RainbowKit
 * version used: 2.0.8
 */

// import type { ReactNode } from 'react'

// import { type AvatarComponent, ConnectButton, RainbowKitProvider } from '@rainbow-me/rainbowkit'
// import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// import { env } from '@/src/env'
// import { chains, transports } from '@/src/core'

// import { Avatar as CustomAvatar } from '@/src/core'

// export const WalletProvider = ({ children }: { children: ReactNode }) => {
//   return (
//     <RainbowKitProvider avatar={CustomAvatar as AvatarComponent}>{children}</RainbowKitProvider>
//   )
// }

// export const ConnectWalletButton = ({ label = 'Connect' }: { label?: string }) => (
//   <ConnectButton label={label} />
// )

// const defaultConfig = {
//   chains,
//   transports,

//   // Required API Keys
//   walletConnectProjectId: env.PUBLIC_WALLETCONNECT_PROJECT_ID,
//   projectId: env.PUBLIC_WALLETCONNECT_PROJECT_ID,

//   // Required App Info
//   appName: env.PUBLIC_APP_NAME,

//   // Optional App Info
//   appDescription: env.PUBLIC_APP_DESCRIPTION,
//   appUrl: env.PUBLIC_APP_URL,
//   appIcon: env.PUBLIC_APP_LOGO,
// } as const

// export const config = getDefaultConfig(defaultConfig)
