// networks.config.ts
/**
 * This file contains the configuration for the networks used in the application.
 *
 * @packageDocumentation
 */
import { http, type Transport } from 'viem'
import { arbitrum, mainnet, optimismSepolia, sepolia, polygon } from 'viem/chains'

import { includeTestNets } from '@/src/constants/common'
import { env } from '@/src/env'

const devChains = [optimismSepolia, sepolia] as const
const prodChains = [mainnet, polygon, arbitrum] as const
const allChains = [...devChains, ...prodChains] as const

export const chains = includeTestNets ? allChains : prodChains

type RestrictedTransports = Record<(typeof chains)[number]['id'], Transport>

export type ChainsIds = (typeof chains)[number]['id']
export type RequiredChainId = (typeof chains)[0]['id']

export const transports: RestrictedTransports = {
  [mainnet.id]: http(env.PUBLIC_RPC_MAINNET),
  [arbitrum.id]: http(env.PUBLIC_RPC_ARBITRUM),
  [optimismSepolia.id]: http(env.PUBLIC_RPC_OPTIMISM_SEPOLIA),
  [polygon.id]: http(env.PUBLIC_RPC_POLYGON),
  [sepolia.id]: http(env.PUBLIC_RPC_SEPOLIA),
}
