import { type GetExplorerUrlParams, getExplorerLink } from '@/src/utils/getExplorerLink'
import { type LinkProps, chakra } from '@chakra-ui/react'
import type { FC } from 'react'

interface ExplorerLinkProps extends GetExplorerUrlParams, LinkProps {
  text?: string
}

/**
 * Link to the explorer for an specific network.
 *
 * @param {ExplorerLinkProps} props - The props of the component.
 * @param {Chain} props.chain - The chain object.
 * @param {string} [props.explorerUrl] - The explorer URL.
 * @param {Hash | Address} props.hashOrAddress - The transaction or address to explore.
 * @param {string} [props.text='View on explorer'] - The text to display in the link.
 *
 * @example
 * ```tsx
 * <ExplorerLink
 *    chainId={optimism}k
 *    hashOrAddress="0x1234567890abcdef1234567890abcdef12345678"
 * />
 * ```
 */
export const ExplorerLink: FC<ExplorerLinkProps> = ({ text = 'View on explorer', ...props }) => {
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
