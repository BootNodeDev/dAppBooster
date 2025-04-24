import CopyButton from '@/src/components/sharedComponents/ui/CopyButton'
import ExternalLink from '@/src/components/sharedComponents/ui/ExternalLink'
import { getTruncatedHash } from '@/src/utils/strings'
import { Flex, type FlexProps, Span } from '@chakra-ui/react'
import type { FC, MouseEventHandler } from 'react'

interface HashProps extends Omit<FlexProps, 'onCopy'> {
  explorerURL?: string
  hash: string
  onCopy?: MouseEventHandler<HTMLButtonElement>
  showCopyButton?: boolean
  truncatedHashLength?: number | 'disabled'
}

/**
 * Hash component, displays a hash with an optional copy button and an optional external link.
 *
 * @param {HashProps} props - Hash component props.
 * @param {string} props.hash - The hash to display.
 * @param {string} [props.explorerURL=''] - The URL to the explorer for the hash. If provided, an external link icon will be displayed. Default is an empty string.
 * @param {MouseEventHandler<HTMLButtonElement>} [props.onCopy=undefined] - The function to call when the copy button is clicked. Default is undefined.
 * @param {boolean} [props.showCopyButton=false] - Whether to show the copy button. Default is false.
 * @param {number | 'disabled'} [props.truncatedHashLength=6] - The number of characters to show at the start and end of the hash. 'disabled' if you don't want to truncate the hash value. Default is 6.
 *
 * @example
 * ```tsx
 * <Hash
 *   hash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 * />
 * ```
 */
const Hash: FC<HashProps> = ({
  explorerURL = '',
  hash,
  onCopy,
  showCopyButton = false,
  truncatedHashLength = 6,
  ...restProps
}: HashProps) => {
  return (
    <Flex
      alignItems="center"
      columnGap={2}
      maxWidth="100%"
      {...restProps}
    >
      <Span
        color="inherit"
        fontSize="inherit"
        maxWidth="fit-content"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        {truncatedHashLength === 'disabled' ? hash : getTruncatedHash(hash, truncatedHashLength)}
      </Span>
      {showCopyButton && (
        <CopyButton
          onClick={onCopy}
          value={hash}
          aria-label="Copy"
        />
      )}
      {explorerURL && <ExternalLink href={explorerURL} />}
    </Flex>
  )
}

export default Hash
