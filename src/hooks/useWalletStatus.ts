import type { Chain } from 'viem'
import { extractChain } from 'viem'

import { useWeb3Status } from '@/src/hooks/useWeb3Status'
import { type ChainsIds, chains } from '@/src/lib/networks.config'

interface UseWalletStatusOptions {
  chainId?: ChainsIds
}

interface WalletStatus {
  isReady: boolean
  needsConnect: boolean
  needsChainSwitch: boolean
  targetChain: Chain
  targetChainId: ChainsIds
  switchChain: (chainId: ChainsIds) => void
}

/** @deprecated Use {@link useWallet} from `@/src/sdk/react/hooks` instead. */
export const useWalletStatus = (options?: UseWalletStatusOptions): WalletStatus => {
  const { appChainId, isWalletConnected, isWalletSynced, switchChain, walletChainId } =
    useWeb3Status()

  const targetChainId = options?.chainId || appChainId || chains[0].id
  const targetChain = extractChain({ chains, id: targetChainId })

  const needsConnect = !isWalletConnected
  const needsChainSwitch = isWalletConnected && (!isWalletSynced || walletChainId !== targetChainId)
  const isReady = isWalletConnected && !needsChainSwitch

  return {
    isReady,
    needsConnect,
    needsChainSwitch,
    targetChain,
    targetChainId,
    switchChain,
  }
}
