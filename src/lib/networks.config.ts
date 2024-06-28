import { http, type Transport } from 'viem'
import { arbitrum, mainnet, optimismSepolia, sepolia, polygon } from 'viem/chains'

import { env } from '@/src/env'

export const chains = [arbitrum, mainnet, optimismSepolia, polygon, sepolia] as const

type RestrictedTransports = Record<(typeof chains)[number]['id'], Transport>

export const transports: RestrictedTransports = {
  [arbitrum.id]: http(env.PUBLIC_RPC_ARBITRUM),
  [mainnet.id]: http(env.PUBLIC_RPC_MAINNET),
  [optimismSepolia.id]: http(env.PUBLIC_RPC_OPTIMISM_SEPOLIA),
  [polygon.id]: http(env.PUBLIC_RPC_POLYGON),
  [sepolia.id]: http(env.PUBLIC_RPC_SEPOLIA),
}
