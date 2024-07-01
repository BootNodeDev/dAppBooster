import { useChainIsSupported } from 'connectkit'
import { Address, Chain } from 'viem'
import {
  UseBalanceReturnType,
  UsePublicClientReturnType,
  UseWalletClientReturnType,
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from 'wagmi'
import { injected } from 'wagmi/connectors'

import { RequiredNonNull } from '@/src/types/utils'

export type AppWeb3Status = {
  appChainId: Chain['id']
  readOnlyClient: UsePublicClientReturnType
  supportedChains: readonly [Chain, ...Chain[]]
}

export type WalletWeb3Status = {
  address: Address | undefined
  balance?: UseBalanceReturnType['data'] | undefined
  connectingWallet: boolean
  switchingChain: boolean
  isWalletConnected: boolean
  isWalletNetworkSupported: boolean | null
  walletChainId: number | undefined
  walletClient: UseWalletClientReturnType['data']
}

export type Web3Actions = {
  switchChain: (chainId: Chain['id']) => void
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
  const appChainId = useChainId()
  const isWalletNetworkSupported = useChainIsSupported(walletChainId)
  const { chains: supportedChains, isPending: switchingChain, switchChain } = useSwitchChain()
  const readOnlyClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { data: balance } = useBalance()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const appWeb3Status = {
    supportedChains,
    appChainId,
    readOnlyClient,
  }

  const walletWeb3Status = {
    address,
    balance,
    walletChainId,
    isWalletConnected,
    isWalletNetworkSupported,
    connectingWallet,
    switchingChain,
    walletClient,
  }

  const web3Actions = {
    switchChain: (chainId: number) => switchChain({ chainId }),
    connect: () => connect({ connector: injected() }),
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
  return useWeb3Status() as RequiredNonNull<Web3Status>
}
