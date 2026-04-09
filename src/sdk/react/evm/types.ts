import type { FC, ReactNode } from 'react'

import type { EvmCoreConnectorConfig } from '../../core/evm/types'

/** App metadata passed to connector factories. Decouples SDK from app env config. */
export interface ConnectorAppMetadata {
  appName: string
  appDescription?: string
  appUrl?: string
  appIcon?: string
  walletConnectProjectId: string
}

/** React-layer EVM connector config — extends core with UI components. */
export interface EvmConnectorConfig extends EvmCoreConnectorConfig {
  WalletProvider: FC<{ children: ReactNode }>
  /** Hook that returns functions to open the connector's connect and account modals. */
  useConnectModal: () => { open: () => void; openAccount?: () => void }
}
