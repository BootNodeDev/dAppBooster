import type { ComponentProps, FC, MouseEventHandler } from 'react'
import styled from 'styled-components'

import { CopyButton, ExternalLink } from '@bootnodedev/db-ui-toolkit'

import { getTruncatedHash } from '@/src/utils/strings'

const Wrapper = styled.div`
  align-items: center;
  column-gap: var(--base-gap, 8px);
  display: flex;
  max-width: 100%;
`

const HashValue = styled.span`
  color: inherit;
  font-size: inherit;
  max-width: fit-content;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

interface HashProps extends Omit<ComponentProps<'div'>, 'onCopy'> {
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
}) => {
  return (
    <Wrapper {...restProps}>
      <HashValue>
        {truncatedHashLength === 'disabled' ? hash : getTruncatedHash(hash, truncatedHashLength)}
      </HashValue>
      {showCopyButton && (
        <CopyButton
          onClick={onCopy}
          value={hash}
        />
      )}
      {explorerURL && <ExternalLink href={explorerURL} />}
    </Wrapper>
  )
}

export default Hash
