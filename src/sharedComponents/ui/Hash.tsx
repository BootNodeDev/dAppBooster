import React, { MouseEventHandler } from 'react'
import styled from 'styled-components'

import { ExternalLink, CopyButton } from 'db-ui-toolkit'

import { getTruncatedHash } from '@/src/utils/strings'

const Wrapper = styled.div`
  align-items: center;
  column-gap: 8px;
  display: flex;
`

const HashValue = styled.span``

interface Props {
  explorerURL?: string
  hash: string
  onCopy?: MouseEventHandler<HTMLButtonElement>
  showCopyButton?: boolean
  truncatedLength?: number
}

/**
 * Hash component, displays a hash with an optional copy button and an optional external link.
 *
 * @param {string} hash - The hash to display.
 * @param {string} [explorerURL] - The URL to the explorer for the hash. If provided, an external link icon will be displayed. Default is an empty string.
 * @param {MouseEventHandler<HTMLButtonElement>} [onCopy=undefined] - The function to call when the copy button is clicked. Default is undefined.
 * @param {boolean} [showCopyButton=false] - Whether to show the copy button. Default is false.
 * @param {number} [truncatedLength] - The number of characters to show at the end of the hash. Default is 6.
 */
const Hash: React.FC<Props> = ({
  explorerURL = '',
  hash,
  onCopy,
  showCopyButton = false,
  truncatedLength,
  ...restProps
}) => {
  return (
    <Wrapper {...restProps}>
      <HashValue>{getTruncatedHash(hash, truncatedLength)}</HashValue>
      {showCopyButton && <CopyButton onClick={onCopy} value={hash} />}
      {explorerURL && <ExternalLink href={explorerURL} />}
    </Wrapper>
  )
}

export default Hash
