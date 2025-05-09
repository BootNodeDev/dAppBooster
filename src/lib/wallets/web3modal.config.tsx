/**
 * Uncomment to use dAppBooster with web3Modal
 * version used: 4.2.1
 */

// import { type FC, type DetailedHTMLProps, type HTMLAttributes, type PropsWithChildren } from 'react'

// import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'

// import { env } from '@/src/env'

// import { chains, transports } from '@/src/lib/networks.config'

// export const WalletProvider: FC<PropsWithChildren> = ({ children }) => children

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       'w3m-button': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
//     }
//   }
// }
// export const ConnectWalletButton = ({ label = 'Connect' }: { label?: string }) => (
//   <w3m-button label={label} />
// )

// // Required API Keys
// const projectId = env.PUBLIC_WALLETCONNECT_PROJECT_ID

// export const config = defaultWagmiConfig({
//   chains,
//   projectId,
//   metadata: {
//     // Required App Info
//     name: env.PUBLIC_APP_NAME,
//     description: env.PUBLIC_APP_DESCRIPTION ?? '',
//     url: env.PUBLIC_APP_URL ?? '',
//     icons: [env.PUBLIC_APP_LOGO ?? ''],
//   },
//   transports,
// })

// createWeb3Modal({
//   wagmiConfig: config,
//   projectId,
// })
