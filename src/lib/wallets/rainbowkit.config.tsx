/**
 * Uncomment to use dAppBooster with RainbowKit
 * version used: 2.0.8
 */

// import { type ReactNode } from 'react'

// import { RainbowKitProvider, type AvatarComponent, ConnectButton } from '@rainbow-me/rainbowkit'
// import { getDefaultConfig } from 'connectkit'
// import { createConfig } from 'wagmi'

// import { env } from '@/src/env'
// import { chains, transports } from '@/src/lib/networks.config'

// import CustomAvatar from '@/src/components/sharedComponents/ui/Avatar'

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

//   // Required App Info
//   appName: env.PUBLIC_APP_NAME,

//   // Optional App Info
//   appDescription: env.PUBLIC_APP_DESCRIPTION,
//   appUrl: env.PUBLIC_APP_URL,
//   appIcon: env.PUBLIC_APP_LOGO,
// } as const

// const rainbowkitConfig = getDefaultConfig(defaultConfig)

// export const config = createConfig(rainbowkitConfig)
