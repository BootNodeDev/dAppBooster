import { Address, Chain } from 'viem'
import {
  UseBalanceReturnType,
  UsePublicClientReturnType,
  UseWalletClientReturnType,
  useAccount,
  useBalance,
  useChainId,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from 'wagmi'

import { chains, type ChainsIds } from '@/src/lib/networks.config'
import { RequiredNonNull } from '@/src/types/utils'

export type AppWeb3Status = {
  readOnlyClient: UsePublicClientReturnType
  appChainId: ChainsIds
}

export type WalletWeb3Status = {
  address: Address | undefined
  balance?: UseBalanceReturnType['data'] | undefined
  connectingWallet: boolean
  switchingChain: boolean
  isWalletConnected: boolean
  walletClient: UseWalletClientReturnType['data']
  isWalletSynced: boolean
  walletChainId: Chain['id'] | undefined
}

export type Web3Actions = {
  switchChain: (chainId?: ChainsIds) => void
  disconnect: () => void
}

export type Web3Status = AppWeb3Status & WalletWeb3Status & Web3Actions

/**
 * Custom hook that provides the status of the Web3 connection.
 *
 * @returns The Web3 connection status, including information about the connected wallet, supported chains, and available actions.
 */
export const useWeb3Status = () => {
  const {
    address,
    chainId: walletChainId,
    isConnected: isWalletConnected,
    isConnecting: connectingWallet,
  } = useAccount()
  const appChainId = useChainId() as ChainsIds
  const { isPending: switchingChain, switchChain } = useSwitchChain()
  const readOnlyClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { data: balance } = useBalance()
  const { disconnect } = useDisconnect()

  const isWalletSynced = isWalletConnected && walletChainId === appChainId

  const appWeb3Status: AppWeb3Status = {
    readOnlyClient,
    appChainId,
  }

  const walletWeb3Status: WalletWeb3Status = {
    address,
    balance,
    isWalletConnected,
    connectingWallet,
    switchingChain,
    walletClient,
    isWalletSynced,
    walletChainId,
  }

  const web3Actions: Web3Actions = {
    switchChain: (chainId: number = chains[0].id) => switchChain({ chainId }), // default to the first chain in the config
    disconnect: disconnect,
  }

  const web3Connection: Web3Status = {
    ...appWeb3Status,
    ...walletWeb3Status,
    ...web3Actions,
  }

  return web3Connection
}

export const useWeb3StatusConnected = () => {
  const context = useWeb3Status()
  if (!context.isWalletConnected) {
    throw new Error('Use useWeb3StatusConnected only when a wallet is connected')
  }
  return useWeb3Status() as RequiredNonNull<Web3Status>
}
