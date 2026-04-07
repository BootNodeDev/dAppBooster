import { useCallback, useEffect, useState } from 'react'
import type { WalletLifecycle } from '../../core/adapters/lifecycle'
import type {
  ChainSigner,
  ConnectOptions,
  SignatureResult,
  SignMessageInput,
  SignTypedDataInput,
  WalletAdapter,
  WalletConnection,
  WalletStatus,
} from '../../core/adapters/wallet'
import {
  AdapterNotFoundError,
  AmbiguousAdapterError,
  CapabilityNotSupportedError,
} from '../../core/errors'
import { useProviderContext } from '../provider/context'

function fireWalletLifecycle<K extends keyof WalletLifecycle>(
  key: K,
  lifecycle: WalletLifecycle | undefined,
  ...args: Parameters<NonNullable<WalletLifecycle[K]>>
): void {
  const fn = lifecycle?.[key] as ((...a: unknown[]) => void) | undefined
  if (!fn) {
    return
  }
  try {
    fn(...(args as unknown[]))
  } catch (err) {
    console.error(`useWallet lifecycle hook "${key}" threw:`, err)
  }
}

export interface UseWalletOptions {
  /** Resolve by chainId — finds the adapter whose supportedChains includes this chainId. */
  chainId?: string | number
  /** Resolve by chainType — finds the adapter with matching chainType. */
  chainType?: string
  /** Explicit adapter — bypasses resolution entirely. */
  adapter?: WalletAdapter
}

export interface UseWalletReturn {
  adapter: WalletAdapter
  /** The key under which this adapter was registered in DAppBoosterConfig.wallets. */
  adapterKey: string | null
  status: WalletStatus
  /** true when connected AND (if chainId option given) connectedChainIds includes that chainId. */
  isReady: boolean
  /** true when not connected and not connecting. */
  needsConnect: boolean
  /** true when connected but the requested chainId is not in connectedChainIds. */
  needsChainSwitch: boolean
  connect: (options?: ConnectOptions) => Promise<WalletConnection>
  disconnect: () => Promise<void>
  signMessage: (input: SignMessageInput) => Promise<SignatureResult>
  signTypedData?: (input: SignTypedDataInput) => Promise<SignatureResult>
  getSigner: () => Promise<ChainSigner | null>
  switchChain: (chainId: string | number) => Promise<void>
  /** Opens the connect modal for this adapter's connector. No-op if no modal is registered. */
  openConnectModal: () => void
  /** Opens the account/disconnect modal. Falls back to openConnectModal if not available. */
  openAccountModal: () => void
}

function chainIdMatch(a: string | number, b: string | number): boolean {
  return String(a) === String(b)
}

interface ResolvedAdapter {
  adapter: WalletAdapter
  /** The key from DAppBoosterConfig.wallets, or null when an explicit adapter was passed. */
  key: string | null
}

/**
 * Resolves a single WalletAdapter from the registered adapters using the provided options.
 *
 * @precondition if options.adapter is set, it is used directly (bypasses provider resolution)
 * @precondition if options.chainType is set, at least one adapter must match that chainType
 * @precondition if options.chainId is set, at least one adapter must support that chainId
 * @postcondition if exactly one adapter is registered and no options given, returns that adapter
 * @throws {AdapterNotFoundError} if no adapter matches the requested chainType or chainId
 * @throws {AmbiguousAdapterError} if multiple adapters exist and no disambiguating option is given
 */
function resolveAdapter(
  walletAdapters: Record<string, WalletAdapter>,
  options: UseWalletOptions,
): ResolvedAdapter {
  if (options.adapter) {
    return { adapter: options.adapter, key: null }
  }

  const entries = Object.entries(walletAdapters)

  if (options.chainType !== undefined) {
    const found = entries.find(([, adapter]) => adapter.chainType === options.chainType)
    if (!found) {
      throw new AdapterNotFoundError(options.chainType, 'wallet')
    }
    return { adapter: found[1], key: found[0] }
  }

  if (options.chainId !== undefined) {
    const chainId = options.chainId
    const found = entries.find(([, adapter]) =>
      adapter.supportedChains.some((chain) => chainIdMatch(chain.chainId, chainId)),
    )
    if (!found) {
      throw new AdapterNotFoundError(chainId, 'wallet')
    }
    return { adapter: found[1], key: found[0] }
  }

  if (entries.length === 1) {
    return { adapter: entries[0][1], key: entries[0][0] }
  }

  throw new AmbiguousAdapterError(entries.map(([, adapter]) => adapter.chainType))
}

/**
 * Resolves a WalletAdapter from the DAppBoosterProvider and subscribes to its status changes.
 *
 * Pass `chainType`, `chainId`, or `adapter` in options to disambiguate when multiple adapters
 * are registered. With a single adapter and no options, it resolves automatically.
 *
 * @precondition must be called inside a DAppBoosterProvider
 * @precondition if multiple adapters registered, options must include chainType, chainId, or adapter
 * @postcondition status is reactive — re-renders on every wallet status change
 * @postcondition signMessage/signTypedData fire global walletLifecycle hooks from provider
 * @throws {AdapterNotFoundError} if no adapter matches the requested chain
 * @throws {AmbiguousAdapterError} if multiple adapters exist and no option disambiguates
 * @throws {CapabilityNotSupportedError} if signTypedData called on adapter without the capability
 */
export function useWallet(options: UseWalletOptions = {}): UseWalletReturn {
  const { walletAdapters, walletLifecycle, connectModalsRef } = useProviderContext()
  const { adapter, key: adapterKey } = resolveAdapter(walletAdapters, options)

  const [status, setStatus] = useState<WalletStatus>(() => adapter.getStatus())

  useEffect(() => {
    setStatus(adapter.getStatus())
    const unsubscribe = adapter.onStatusChange(setStatus)
    return unsubscribe
  }, [adapter])

  const chainId = options.chainId

  const isReady =
    status.connected &&
    (chainId === undefined || status.connectedChainIds.some((id) => chainIdMatch(id, chainId)))

  const needsConnect = !status.connected && !status.connecting

  const needsChainSwitch =
    status.connected &&
    chainId !== undefined &&
    !status.connectedChainIds.some((id) => chainIdMatch(id, chainId))

  const signMessage = useCallback(
    async (input: SignMessageInput): Promise<SignatureResult> => {
      fireWalletLifecycle('onSign', walletLifecycle, 'message', input)
      try {
        const result = await adapter.signMessage(input)
        fireWalletLifecycle('onSignComplete', walletLifecycle, result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        fireWalletLifecycle('onSignError', walletLifecycle, error)
        throw err
      }
    },
    [adapter, walletLifecycle],
  )

  const signTypedDataImpl = useCallback(
    async (input: SignTypedDataInput): Promise<SignatureResult> => {
      if (!adapter.signTypedData) {
        throw new CapabilityNotSupportedError('signTypedData')
      }
      fireWalletLifecycle('onSign', walletLifecycle, 'typedData', input)
      try {
        const result = await adapter.signTypedData(input)
        fireWalletLifecycle('onSignComplete', walletLifecycle, result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        fireWalletLifecycle('onSignError', walletLifecycle, error)
        throw err
      }
    },
    [adapter, walletLifecycle],
  )

  const signTypedData = adapter.signTypedData ? signTypedDataImpl : undefined

  const openConnectModal = useCallback(() => {
    if (adapterKey) {
      connectModalsRef.current[adapterKey]?.open()
    }
  }, [adapterKey, connectModalsRef])

  const openAccountModal = useCallback(() => {
    if (adapterKey) {
      const modals = connectModalsRef.current[adapterKey]
      if (modals?.openAccount) {
        modals.openAccount()
      } else {
        modals?.open()
      }
    }
  }, [adapterKey, connectModalsRef])

  return {
    adapter,
    adapterKey,
    status,
    isReady,
    needsConnect,
    needsChainSwitch,
    connect: adapter.connect,
    disconnect: adapter.disconnect,
    signMessage,
    signTypedData,
    getSigner: adapter.getSigner,
    switchChain: adapter.switchChain,
    openConnectModal,
    openAccountModal,
  }
}
