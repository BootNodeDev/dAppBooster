import type { IconComponent } from '@web3icons/react'
import {
  NetworkArbitrumOne,
  NetworkEthereum,
  NetworkOptimism,
  NetworkOptimismSepolia,
  NetworkPolygon,
  NetworkSepolia,
} from '@web3icons/react'

import type { ChainsIds } from '@/src/lib/networks.config'

export const nativeTokenIcons: Record<ChainsIds, IconComponent> = {
  1: NetworkEthereum,
  10: NetworkOptimism,
  137: NetworkPolygon,
  42161: NetworkArbitrumOne,
  11155111: NetworkSepolia,
  11155420: NetworkOptimismSepolia,
}
