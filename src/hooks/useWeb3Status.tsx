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

export type Web3Status = {
  address: Address | undefined
  appChainId: Chain['id']
  balance?: UseBalanceReturnType['data'] | undefined
  connectingWallet: boolean
  changingChain: boolean
  isWalletConnected: boolean
  isWalletNetworkSupported: boolean | null
  readOnlyClient: UsePublicClientReturnType
  walletChainId: number | undefined
  walletClient: UseWalletClientReturnType['data']
  supportedChains: readonly [Chain, ...Chain[]]
  switchChain: (chainId: Chain['id']) => void
  disconnect: () => void
}

/**
 * Custom hook that provides the status of the Web3 connection.
 *
 * @returns The Web3 connection status, including information about the connected wallet, supported chains, and available actions.
 */
export const useWeb3Status = () => {
  const { address, chainId: walletChainId, isConnected, isConnecting } = useAccount()
  const appChainId = useChainId()
  const isWalletNetworkSupported = useChainIsSupported(walletChainId)
  const { chains, isPending, switchChain } = useSwitchChain()
  const readOnlyClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { data: balance } = useBalance()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const appWeb3Status = {
    supportedChains: chains,
    appChainId,
  }

  const walletWeb3Status = {
    address,
    balance,
    walletChainId,
    isWalletConnected: isConnected,
    isWalletNetworkSupported,
    connectingWallet: isConnecting,
    changingChain: isPending,
    walletClient: walletClient,
    readOnlyClient,
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
