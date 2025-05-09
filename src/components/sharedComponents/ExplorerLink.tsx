import { type GetExplorerUrlParams, getExplorerLink } from '@/src/utils/getExplorerLink'
import { type LinkProps, chakra } from '@chakra-ui/react'
import type { FC } from 'react'

interface ExplorerLinkProps extends GetExplorerUrlParams, LinkProps {
  text?: string
}

/**
 * Link to blockchain explorer for the specified network.
 *
 * This component renders a link to the appropriate blockchain explorer based on the provided chain
 * and hash/address, allowing users to view transactions, addresses, or other on-chain data.
 *
 * @param {ExplorerLinkProps} props - The props for the ExplorerLink component.
 * @param {Chain} props.chain - The blockchain network (from viem chains).
 * @param {string} [props.explorerUrl] - Optional custom explorer URL to override the default.
 * @param {Hash | Address} props.hashOrAddress - The transaction hash or address to view in the explorer.
 * @param {string} [props.text='View on explorer'] - The text displayed in the link.
 * @param {LinkProps} props.restProps - Additional props inherited from Chakra UI LinkProps.
 *
 * @example
 * ```tsx
 * <ExplorerLink
 *   chain={optimism}
 *   hashOrAddress="0x1234567890abcdef1234567890abcdef12345678"
 *   text="View transaction"
 * />
 * ```
 */
export const ExplorerLink: FC<ExplorerLinkProps> = ({
  text = 'View on explorer',
  ...props
}: ExplorerLinkProps) => {
  return (
    <chakra.a
      href={getExplorerLink(props)}
      rel="noopener noreferrer"
      target="_blank"
    >
      {text}
    </chakra.a>
  )
}
