import { http, type Transport } from 'viem'
import { arbitrum, mainnet, optimismSepolia, sepolia, polygon } from 'viem/chains'

import { isDev } from '@/src/constants/common'
import { env } from '@/src/env'

const devChains = [optimismSepolia, sepolia] as const
const prodChains = [mainnet, polygon, arbitrum] as const

export const chains = isDev ? devChains : prodChains

type RestrictedTransports = Record<(typeof chains)[number]['id'], Transport>

export const transports: RestrictedTransports = {
  [mainnet.id]: http(env.PUBLIC_RPC_MAINNET),
  [arbitrum.id]: http(env.PUBLIC_RPC_ARBITRUM),
  [optimismSepolia.id]: http(env.PUBLIC_RPC_OPTIMISM_SEPOLIA),
  [polygon.id]: http(env.PUBLIC_RPC_POLYGON),
  [sepolia.id]: http(env.PUBLIC_RPC_SEPOLIA),
}
