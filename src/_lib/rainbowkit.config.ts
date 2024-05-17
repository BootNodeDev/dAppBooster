/**
 * Uncomment to use dAppBooster with RainbowKit
 */

// import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit'
// import { http } from 'wagmi'
// import { mainnet, sepolia, optimismSepolia } from 'wagmi/chains'

// import { env } from '@/src/env'

// export const WalletProvider = RainbowKitProvider

// export const ConnectWalletButton = ConnectButton

// export const config = getDefaultConfig({
//   chains: [mainnet, sepolia, optimismSepolia],
//   transports: {
//     [mainnet.id]: http(
//       env.PUBLIC_ALCHEMY_ID
//         ? `https://eth-mainnet.g.alchemy.com/v2/${env.PUBLIC_ALCHEMY_ID}`
//         : undefined,
//     ),
//     [sepolia.id]: http(),
//     [optimismSepolia.id]: http('https://sepolia.optimism.io'),
//   },

//   // Required API Keys
//   projectId: env.PUBLIC_WALLETCONNECT_PROJECT_ID,

//   // Required App Info
//   appName: env.PUBLIC_APP_NAME,

//   // Optional App Info
//   appDescription: env.PUBLIC_APP_DESCRIPTION,
//   appUrl: env.PUBLIC_APP_URL,
//   appIcon: env.PUBLIC_APP_LOGO,
// })
