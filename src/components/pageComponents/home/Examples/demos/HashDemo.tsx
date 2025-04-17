import type { FC } from 'react'
import styled from 'styled-components'

import { Toast } from '@bootnodedev/db-ui-toolkit'
import { toast } from 'react-hot-toast'
import type { Address, Chain } from 'viem'

import Hash from '@/src/components/sharedComponents/Hash'
import { getExplorerLink } from '@/src/utils/getExplorerLink'

const Wrapper = styled(Hash)`
  [data-theme='light'] & {
    --theme-hash-background-color: #fff;
    --theme-hash-border-color: #c5c2cb;
    --theme-hash-color: #2e3048;
  }

  [data-theme='dark'] & {
    --theme-hash-background-color: #2e3047;
    --theme-hash-border-color: #5f6178;
    --theme-hash-color: #fff;
  }

  background-color: var(--theme-hash-background-color);
  border-radius: var(--base-border-radius);
  border: 1px solid var(--theme-hash-border-color);
  color: var(--theme-hash-color);
  cursor: default;
  font-size: 1.6rem;
  height: 34px;
  min-width: 0;
  padding: 0 calc(var(--base-common-padding) * 2);
`

interface Props {
  chain: Chain
  hash: Address | undefined
  truncatedHashLength?: number | 'disabled'
}

/**
 * Hash component demo.
 *
 * Some styles were added. Also we show a toast when the copy button is clicked
 * to let the user know that something has happened.
 */
const HashDemo: FC<Props> = ({ chain, hash, ...restProps }) => {
  const onCopy = (message: string) => {
    const timeDelay = 2500

    navigator.clipboard.writeText(message)
    toast.custom(<Toast>Copied to the clipboard!</Toast>, {
      duration: timeDelay,
      position: 'top-center',
      id: 'copy-to-clipboard',
    })
  }

  return hash ? (
    <Wrapper
      explorerURL={getExplorerLink({ chain, hashOrAddress: hash })}
      hash={hash}
      onCopy={() => onCopy(hash)}
      showCopyButton
      {...restProps}
    />
  ) : null
}

export default HashDemo
