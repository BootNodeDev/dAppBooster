import type { Address, Chain } from 'viem'
import {
  type UseBalanceReturnType,
  type UsePublicClientReturnType,
  type UseWalletClientReturnType,
  useAccount,
  useBalance,
  useChainId,
  useDisconnect,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from 'wagmi'

import { type ChainsIds, chains } from '@/src/lib/networks.config'
import type { RequiredNonNull } from '@/src/types/utils'

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
 * Custom hook that provides comprehensive Web3 connection state and actions.
 *
 * Aggregates various Wagmi hooks to provide a unified interface for Web3 state management,
 * including wallet connection status, chain information, and common actions.
 *
 * The hook provides three categories of data:
 * - App Web3 Status: Information about the app's current blockchain context
 * - Wallet Web3 Status: Information about the connected wallet
 * - Web3 Actions: Functions to modify connection state
 *
 * @returns {Web3Status} Combined object containing:
 * @returns {UsePublicClientReturnType} returns.readOnlyClient - Public client for read operations
 * @returns {ChainsIds} returns.appChainId - Current chain ID of the application
 * @returns {Address|undefined} returns.address - Connected wallet address (if any)
 * @returns {UseBalanceReturnType['data']|undefined} returns.balance - Wallet balance information
 * @returns {boolean} returns.connectingWallet - Indicates if wallet connection is in progress
 * @returns {boolean} returns.switchingChain - Indicates if chain switching is in progress
 * @returns {boolean} returns.isWalletConnected - Whether a wallet is currently connected
 * @returns {UseWalletClientReturnType['data']} returns.walletClient - Wallet client for write operations
 * @returns {boolean} returns.isWalletSynced - Whether wallet chain matches app chain
 * @returns {Chain['id']|undefined} returns.walletChainId - Current chain ID of connected wallet
 * @returns {Function} returns.switchChain - Function to switch to a different chain
 * @returns {Function} returns.disconnect - Function to disconnect wallet
 *
 * @example
 * ```tsx
 * const {
 *   address,
 *   balance,
 *   isWalletConnected,
 *   appChainId,
 *   switchChain,
 *   disconnect
 * } = useWeb3Status();
 *
 * return (
 *   <div>
 *     {isWalletConnected ? (
 *       <>
 *         <p>Connected to: {address}</p>
 *         <p>Balance: {balance?.formatted} {balance?.symbol}</p>
 *         <button onClick={() => switchChain(1)}>Switch to Ethereum</button>
 *         <button onClick={disconnect}>Disconnect</button>
 *       </>
 *     ) : (
 *       <p>Wallet not connected</p>
 *     )}
 *   </div>
 * );
 * ```
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
