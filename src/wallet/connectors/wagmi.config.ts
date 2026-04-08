/**
 * Shared wagmi Config and connector — the single place to choose which EVM connector to use.
 * Both the SDK adapter (in __root.tsx) and generated contract hooks reference this file.
 *
 * To switch connectors, change the import below:
 *   import { connectkitConnector as connector } from '@/src/sdk/react/evm'
 *   import { rainbowkitConnector as connector } from '@/src/sdk/react/evm'
 *   import { reownConnector as connector } from '@/src/sdk/react/evm'
 */
import { chains, transports } from '@/src/core/types'
import { connectkitConnector as connector } from '@/src/sdk/react/evm'

export { connector }
export const config = connector.createConfig([...chains], transports)
