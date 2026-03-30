import { extractChain } from 'viem'
import type { Chain } from 'viem'

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
  switchChain: (chainId: ChainsIds) => void
}

export const useWalletStatus = (options?: UseWalletStatusOptions): WalletStatus => {
  const { appChainId, isWalletConnected, isWalletSynced, switchChain, walletChainId } =
    useWeb3Status()

  const targetChain = extractChain({
    chains,
    id: options?.chainId || appChainId || chains[0].id,
  })

  const needsConnect = !isWalletConnected
  const needsChainSwitch =
    isWalletConnected && (!isWalletSynced || walletChainId !== targetChain.id)
  const isReady = isWalletConnected && !needsChainSwitch

  return {
    isReady,
    needsConnect,
    needsChainSwitch,
    targetChain,
    switchChain,
  }
}
