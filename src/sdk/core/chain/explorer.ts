import type { ChainRegistry } from './registry'

type ExplorerParams =
  | { chainId: string | number; tx: string }
  | { chainId: string | number; address: string }
  | { chainId: string | number; block: string | number }

/**
 * Builds an explorer URL for a transaction, address, or block.
 *
 * @expects registry is a valid ChainRegistry
 * @expects params.chainId identifies a chain, params contains exactly one of tx/address/block
 * @postcondition returns a fully qualified URL string, or null if chain/explorer/path not found
 * @postcondition if explorer.queryParams is defined, they are appended as URL search params
 */
export function getExplorerUrl(registry: ChainRegistry, params: ExplorerParams): string | null {
  const descriptor = registry.getChain(params.chainId)

  if (!descriptor?.explorer) {
    return null
  }

  const { explorer } = descriptor

  const { path, value } = (() => {
    if ('tx' in params) return { path: explorer.txPath, value: params.tx }
    if ('address' in params) return { path: explorer.addressPath, value: params.address }
    return { path: explorer.blockPath, value: String(params.block) }
  })()

  if (!path) return null

  const resolvedPath = path.replace('{id}', value)
  const base = `${explorer.url}${resolvedPath}`

  if (!explorer.queryParams) {
    return base
  }

  const searchParams = new URLSearchParams(explorer.queryParams)
  return `${base}?${searchParams.toString()}`
}
