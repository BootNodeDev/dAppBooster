import { chakra, type LinkProps } from '@chakra-ui/react'
import type { FC } from 'react'
import { getExplorerUrl } from '@/src/sdk/core/chain/explorer'
import { useChainRegistry } from '@/src/sdk/react/hooks'

type ExplorerLinkBaseProps = LinkProps & {
  chainId: string | number
  text?: string
}

export type ExplorerLinkProps =
  | (ExplorerLinkBaseProps & { tx: string; address?: never; block?: never })
  | (ExplorerLinkBaseProps & { tx?: never; address: string; block?: never })
  | (ExplorerLinkBaseProps & { tx?: never; address?: never; block: string | number })

/**
 * Link to blockchain explorer for the specified network.
 *
 * Renders a link to the chain's configured block explorer for a transaction,
 * address, or block. The chain is resolved through the SDK's `ChainRegistry`,
 * so the consumer only needs to provide a `chainId`.
 *
 * Exactly one of `tx`, `address`, or `block` must be provided (enforced via
 * discriminated union).
 *
 * @example
 * ```tsx
 * <ExplorerLink chainId={10} tx="0x1234...abcd" text="View transaction" />
 * <ExplorerLink chainId={1} address="0xabc...123" />
 * <ExplorerLink chainId={1} block={18000000} />
 * ```
 */
export const ExplorerLink: FC<ExplorerLinkProps> = ({
  text = 'View on explorer',
  chainId,
  tx,
  address,
  block,
  ...linkProps
}) => {
  const registry = useChainRegistry()

  const params =
    tx !== undefined
      ? { chainId, tx }
      : address !== undefined
        ? { chainId, address }
        : { chainId, block: block as string | number }

  const url = getExplorerUrl(registry, params)

  return (
    <chakra.a
      href={url ?? '#'}
      rel="noopener noreferrer"
      target="_blank"
      {...linkProps}
    >
      {text}
    </chakra.a>
  )
}
