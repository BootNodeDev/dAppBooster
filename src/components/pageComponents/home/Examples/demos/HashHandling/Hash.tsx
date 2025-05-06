import BaseHash from '@/src/components/sharedComponents/Hash'
import { toaster } from '@/src/components/ui/toaster'
import { getExplorerLink } from '@/src/utils/getExplorerLink'
import type { FlexProps } from '@chakra-ui/react'
import type { FC } from 'react'
import type { Address, Chain } from 'viem'

interface Props extends FlexProps {
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
const Hash: FC<Props> = ({ chain, hash, truncatedHashLength }) => {
  const onCopy = (message: string) => {
    const timeDelay = 2500

    navigator.clipboard.writeText(message)
    toaster.create({
      description: 'Copied to the clipboard!',
      duration: timeDelay,
      type: 'success',
      id: 'copy-to-clipboard',
    })
  }
  return hash ? (
    <BaseHash
      css={{
        '.light &': {
          '--theme-hash-background-color': '#fff',
          '--theme-hash-border-color': '#c5c2cb',
          '--theme-hash-color': '#2e3048',
        },
        '.dark &': {
          '--theme-hash-background-color': '#2e3047',
          '--theme-hash-border-color': '#5f6178',
          '--theme-hash-color': '#fff',
        },
      }}
      backgroundColor="var(--theme-hash-background-color)"
      border="1px solid var(--theme-hash-border-color)"
      borderRadius="4px"
      color="var(--theme-hash-color)"
      cursor="default"
      explorerURL={getExplorerLink({ chain, hashOrAddress: hash })}
      fontSize="16px"
      hash={hash}
      height="34px"
      minWidth="0"
      onCopy={() => onCopy(hash)}
      paddingY={0}
      paddingX={4}
      showCopyButton
      truncatedHashLength={truncatedHashLength}
    />
  ) : null
}

export default Hash
