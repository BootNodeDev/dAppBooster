/**
 * Shared wagmi Config and connector — the single place to choose which EVM connector to use.
 * Both the SDK adapter (in __root.tsx) and generated contract hooks reference this file.
 *
 * To switch connectors, change the factory call below:
 *   createConnectkitConnector(metadata)
 *   createRainbowkitConnector(metadata)
 *   createReownConnector(metadata)
 */
import { chains, transports } from '@/src/core/types'
import { env } from '@/src/env'
import { createConnectkitConnector } from '@/src/sdk/evm-adapter/react/connectors/connectkit'

export const connector = createConnectkitConnector({
  appName: env.PUBLIC_APP_NAME,
  appDescription: env.PUBLIC_APP_DESCRIPTION,
  appUrl: env.PUBLIC_APP_URL,
  appIcon: env.PUBLIC_APP_LOGO,
  walletConnectProjectId: env.PUBLIC_WALLETCONNECT_PROJECT_ID,
})

export const config = connector.createConfig([...chains], transports)
