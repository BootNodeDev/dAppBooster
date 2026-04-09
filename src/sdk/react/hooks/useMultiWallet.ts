import { useCallback, useEffect, useMemo, useState } from 'react'
import type { WalletStatus } from '../../core/adapters/wallet'
import { wrapSignMessage, wrapSignTypedData } from '../internal/walletLifecycle'
import { useProviderContext } from '../provider/context'
import type { UseWalletReturn } from './useWallet'

/** Return type for the useMultiWallet hook. */
export interface UseMultiWalletReturn {
  /** All wallet entries keyed by adapter name (e.g. 'evm', 'solana'). */
  wallets: Record<string, UseWalletReturn>
  /**
   * Returns the wallet entry whose adapter matches the given chainType.
   * @expects chainType is a non-empty string
   * @postcondition returns the first matching UseWalletReturn or undefined
   */
  getWallet(chainType: string): UseWalletReturn | undefined
  /**
   * Returns the wallet entry whose adapter's supportedChains includes the given chainId.
   * @expects chainId is a string or number identifying a chain
   * @postcondition returns the first matching UseWalletReturn or undefined
   */
  getWalletByChainId(chainId: string | number): UseWalletReturn | undefined
  /**
   * Record of adapter name to active account address for all connected wallets.
   * Disconnected wallets are omitted.
   * @postcondition every value is a non-null address string
   */
  connectedAddresses: Record<string, string>
}

/**
 * Returns a UseMultiWalletReturn with all registered wallet adapters and convenience methods.
 * @postcondition wallets record keys match the names used in DAppBoosterConfig.wallets
 */
export function useMultiWallet(): UseMultiWalletReturn {
  const { walletAdapters, walletLifecycle, connectModalsRef } = useProviderContext()

  const [statuses, setStatuses] = useState<Record<string, WalletStatus>>(() =>
    Object.fromEntries(
      Object.entries(walletAdapters).map(([key, adapter]) => [key, adapter.getStatus()]),
    ),
  )

  useEffect(() => {
    // Re-read current statuses on mount (guards against changes between render and effect)
    setStatuses(
      Object.fromEntries(
        Object.entries(walletAdapters).map(([key, adapter]) => [key, adapter.getStatus()]),
      ),
    )
    // Subscribe to all adapters
    const unsubscribes = Object.entries(walletAdapters).map(([key, adapter]) =>
      adapter.onStatusChange((status) => {
        setStatuses((previous) => ({ ...previous, [key]: status }))
      }),
    )
    return () => {
      for (const unsub of unsubscribes) {
        unsub()
      }
    }
  }, [walletAdapters])

  const wallets = useMemo<Record<string, UseWalletReturn>>(
    () =>
      Object.fromEntries(
        Object.entries(walletAdapters).map(([key, adapter]) => {
          const status = statuses[key] ?? adapter.getStatus()
          const isReady = status.connected
          const needsConnect = !status.connected && !status.connecting
          const needsChainSwitch = false

          return [
            key,
            {
              adapter,
              adapterKey: key,
              status,
              isReady,
              needsConnect,
              needsChainSwitch,
              connect: adapter.connect,
              disconnect: adapter.disconnect,
              signMessage: wrapSignMessage(adapter, walletLifecycle),
              signTypedData: wrapSignTypedData(adapter, walletLifecycle),
              getSigner: adapter.getSigner,
              switchChain: adapter.switchChain,
              openConnectModal: () => {
                connectModalsRef.current[key]?.open()
              },
              openAccountModal: () => {
                const modals = connectModalsRef.current[key]
                if (modals?.openAccount) {
                  modals.openAccount()
                } else {
                  modals?.open()
                }
              },
            },
          ]
        }),
      ),
    [statuses, walletAdapters, walletLifecycle, connectModalsRef],
  )

  const getWallet = useCallback(
    (chainType: string): UseWalletReturn | undefined =>
      Object.values(wallets).find((entry) => entry.adapter.chainType === chainType),
    [wallets],
  )

  const getWalletByChainId = useCallback(
    (chainId: string | number): UseWalletReturn | undefined => {
      const normalized = String(chainId)
      return Object.values(wallets).find((entry) =>
        entry.adapter.supportedChains.some((chain) => String(chain.chainId) === normalized),
      )
    },
    [wallets],
  )

  const connectedAddresses = useMemo<Record<string, string>>(() => {
    const result: Record<string, string> = {}
    for (const [key, entry] of Object.entries(wallets)) {
      if (entry.status.connected && entry.status.activeAccount) {
        result[key] = entry.status.activeAccount
      }
    }
    return result
  }, [wallets])

  return useMemo(
    () => ({ wallets, getWallet, getWalletByChainId, connectedAddresses }),
    [wallets, getWallet, getWalletByChainId, connectedAddresses],
  )
}
