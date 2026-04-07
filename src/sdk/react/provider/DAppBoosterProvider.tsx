import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import type { DAppBoosterConfig, WalletAdapterBundle } from '../../core/adapters/provider'
import type { ChainDescriptor } from '../../core/chain/descriptor'
import { createChainRegistry } from '../../core/chain/registry'
import type { DAppBoosterContextValue } from './context'
import { DAppBoosterContext } from './context'

interface DAppBoosterProviderProps extends PropsWithChildren {
  config?: DAppBoosterConfig
}

/**
 * Bridge component rendered once per wallet bundle that has a `useConnectModal` hook.
 * Calls the connector-specific hook (ConnectKit's useModal, RainbowKit's useConnectModal, etc.)
 * inside the bundle's Provider tree, and registers the resulting `open` function in a shared ref.
 */
function ConnectModalBridge({
  adapterKey,
  hook,
  register,
  unregister,
}: {
  adapterKey: string
  hook: () => { open: () => void; openAccount?: () => void }
  register: (key: string, modals: { open: () => void; openAccount?: () => void }) => void
  unregister: (key: string) => void
}) {
  const modals = hook()
  useEffect(() => {
    register(adapterKey, modals)
    return () => unregister(adapterKey)
  }, [adapterKey, modals, register, unregister])
  return null
}

/**
 * Root provider for the dAppBooster adapter architecture.
 *
 * Automatically mounts each wallet bundle's Provider (wagmi, query client,
 * wallet-specific UI provider) so the active connector is determined entirely
 * by the `config.wallets` you pass in — no hardcoded Web3Provider.
 *
 * Each bundle's `useConnectModal` hook is called via a bridge component inside
 * the bundle's Provider tree. The resulting `open` functions are stored per
 * adapter key so that `useWallet` can resolve the correct modal for any adapter.
 *
 * @note Memoize the `config` prop (e.g. with `useMemo`) to avoid rebuilding
 * the chain registry on every parent re-render.
 */
export const DAppBoosterProvider: FC<DAppBoosterProviderProps> = ({ config = {}, children }) => {
  const walletEntries = Object.entries(config.wallets ?? {})
  const connectModalsRef = useRef<Record<string, { open: () => void; openAccount?: () => void }>>(
    {},
  )

  const registerModal = useCallback(
    (key: string, modals: { open: () => void; openAccount?: () => void }) => {
      connectModalsRef.current[key] = modals
    },
    [],
  )

  const unregisterModal = useCallback((key: string) => {
    delete connectModalsRef.current[key]
  }, [])

  const contextValue = useMemo<DAppBoosterContextValue>(() => {
    const wallets = Object.entries(config.wallets ?? {})
    const txAdapters = Object.entries(config.transactions ?? {})

    for (const [key, bundle] of wallets) {
      for (const chain of bundle.adapter.supportedChains) {
        if (chain.chainType !== bundle.adapter.chainType) {
          throw new Error(
            `Wallet adapter "${key}" has chainType "${bundle.adapter.chainType}" but supportedChains contains "${chain.name}" with chainType "${chain.chainType}" — chainType mismatch.`,
          )
        }
      }
    }
    for (const [key, adapter] of txAdapters) {
      for (const chain of adapter.supportedChains) {
        if (chain.chainType !== adapter.chainType) {
          throw new Error(
            `Transaction adapter "${key}" has chainType "${adapter.chainType}" but supportedChains contains "${chain.name}" with chainType "${chain.chainType}" — chainType mismatch.`,
          )
        }
      }
    }

    const allChains = [
      ...(config.chains ?? []),
      ...wallets.flatMap(([, bundle]) => bundle.adapter.supportedChains),
      ...txAdapters.flatMap(([, adapter]) => adapter.supportedChains),
    ]

    const seen = new Map<string, ChainDescriptor>()
    const deduped: ChainDescriptor[] = []

    for (const chain of allChains) {
      const existing = seen.get(chain.caip2Id)
      if (!existing) {
        seen.set(chain.caip2Id, chain)
        deduped.push(chain)
      } else if (JSON.stringify(existing) !== JSON.stringify(chain)) {
        // Structurally different descriptors with the same caip2Id — let the registry throw
        deduped.push(chain)
      }
      // Otherwise structurally identical — skip the duplicate
    }

    const registry = createChainRegistry(deduped)

    return {
      walletAdapters: Object.fromEntries(wallets.map(([key, bundle]) => [key, bundle.adapter])),
      transactionAdapters: config.transactions ?? {},
      registry,
      lifecycle: config.lifecycle,
      walletLifecycle: config.walletLifecycle,
      readClientFactories: config.readClientFactories ?? [],
      connectModalsRef,
    }
  }, [config])

  const bridges = walletEntries
    .filter(([, bundle]) => bundle.useConnectModal)
    .map(([key, bundle]) => (
      <ConnectModalBridge
        key={key}
        adapterKey={key}
        hook={bundle.useConnectModal as NonNullable<WalletAdapterBundle['useConnectModal']>}
        register={registerModal}
        unregister={unregisterModal}
      />
    ))

  let wrapped: ReactNode = (
    <DAppBoosterContext.Provider value={contextValue}>
      {bridges}
      {children}
    </DAppBoosterContext.Provider>
  )

  for (const [, bundle] of walletEntries) {
    if (bundle.Provider) {
      const BundleProvider = bundle.Provider
      wrapped = <BundleProvider>{wrapped}</BundleProvider>
    }
  }

  return wrapped
}
