import { http, type Transport } from 'viem'
import { mainnet, optimismSepolia, sepolia } from 'viem/chains'

import { env } from '@/src/env'

const isDevMode = env.PUBLIC_DEV_MODE === 'true'

export const allChains = [mainnet, optimismSepolia, sepolia] as const

export const chains = allChains.filter((chain) => (isDevMode ? chain.testnet : !chain.testnet))

type RestrictedTransports = Record<(typeof chains)[number]['id'], Transport>

export const transports: RestrictedTransports = {
  [mainnet.id]: http(env.PUBLIC_RPC_MAINNET),
  [optimismSepolia.id]: http(env.PUBLIC_RPC_OP_SEPOLIA),
  [sepolia.id]: http(env.PUBLIC_RPC_SEPOLIA),
}
