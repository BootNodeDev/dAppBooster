// networks.config.ts
/**
 * This file contains the configuration for the networks used in the application.
 *
 * @packageDocumentation
 */
import { http, type Transport } from 'viem'
import { arbitrum, mainnet, optimism, optimismSepolia, polygon, sepolia } from 'viem/chains'

import { includeTestnets } from '@/src/constants/common'
import { env } from '@/src/env'

const devChains = [optimismSepolia, sepolia] as const
const prodChains = [mainnet, polygon, arbitrum, optimism] as const
const allChains = [...devChains, ...prodChains] as const
export const chains = includeTestnets ? allChains : prodChains
export type ChainsIds = (typeof chains)[number]['id']

type RestrictedTransports = Record<ChainsIds, Transport>
export const transports: RestrictedTransports = {
  [mainnet.id]: http(env.PUBLIC_RPC_MAINNET),
  [arbitrum.id]: http(env.PUBLIC_RPC_ARBITRUM),
  [optimism.id]: http(env.PUBLIC_RPC_OPTIMISM),
  [optimismSepolia.id]: http(env.PUBLIC_RPC_OPTIMISM_SEPOLIA),
  [polygon.id]: http(env.PUBLIC_RPC_POLYGON),
  [sepolia.id]: http(env.PUBLIC_RPC_SEPOLIA),
}
