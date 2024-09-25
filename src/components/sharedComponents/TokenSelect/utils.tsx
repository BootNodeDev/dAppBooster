import type { Chain } from 'viem/chains'

import type { Networks } from '@/src/components/sharedComponents/TokenSelect/types'
import type { ChainsIds, chains } from '@/src/lib/networks.config'

interface GetValidChainIdParams {
  currentNetworkId?: Chain['id']
  networks?: Networks
  dappChains: typeof chains
  walletChainId?: Chain['id']
  appChainId?: ChainsIds
}

export const getValidChainId = ({
  appChainId,
  currentNetworkId,
  dappChains,
  networks,
  walletChainId,
}: GetValidChainIdParams): Chain['id'] => {
  // If the current network is defined, use it
  if (currentNetworkId) {
    return currentNetworkId
  }

  // if `networks` has been passed, then we need to stick with
  if (networks !== undefined) {
    // we prioritze the wallet chainId over the app chainId because it may be valid in this case,
    //  but not supported by the app to interact with but as a read-only chain.
    if (typeof walletChainId === 'number' && networks.some(({ id }) => id === walletChainId)) {
      return walletChainId
    }

    if (typeof appChainId === 'number' && networks.some(({ id }) => id === appChainId)) {
      return appChainId
    }

    // if nothing matches, we default to the first network in the list
    return networks[0].id
  }

  // if `networks` is not defined, we need to verify the dApp configuration
  // Same as before, we prioritize the wallet chainId over the app chainId
  if (typeof walletChainId === 'number' && dappChains.some(({ id }) => id === walletChainId)) {
    return walletChainId
  }

  if (typeof appChainId === 'number' && dappChains.some(({ id }) => id === appChainId)) {
    return appChainId
  }

  // if nothing matches, we default to the first chain in the list
  return dappChains[0].id
}
