/**
 * Uncomment to use dAppBooster with web3Modal
 */

// import React, { PropsWithChildren } from 'react'

// import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
// import { mainnet, sepolia, optimismSepolia } from 'wagmi/chains'

// import { env } from '@/src/env'

// export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => children

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace JSX {
//     interface IntrinsicElements {
//       'w3m-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
//     }
//   }
// }
// export const ConnectWalletButton = () => <w3m-button />

// // Required API Keys
// const projectId = env.PUBLIC_WALLETCONNECT_PROJECT_ID

// export const config = defaultWagmiConfig({
//   chains: [mainnet, sepolia, optimismSepolia],
//   projectId,
//   metadata: {
//     // Required App Info
//     name: env.PUBLIC_APP_NAME,
//     description: env.PUBLIC_APP_DESCRIPTION ?? '',
//     url: env.PUBLIC_APP_URL ?? '',
//     icons: [env.PUBLIC_APP_LOGO ?? ''],
//   },
// })

// createWeb3Modal({
//   wagmiConfig: config,
//   projectId,
// })
