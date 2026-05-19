import type { FlexProps } from '@chakra-ui/react'
import type { FC } from 'react'
import type { Address } from 'viem'
import { Hash as BaseHash, toaster } from '@/src/core/components'
import { getExplorerUrl } from '@/src/sdk/core/chain/explorer'
import { useChainRegistry } from '@/src/sdk/react/hooks'

interface Props extends FlexProps {
  chainId: number | undefined
  hash: Address | undefined
  /**
   * Discriminates how to build the explorer URL.
   *
   * - `'tx'` — `hash` is a transaction hash
   * - `'address'` — `hash` is an EOA, contract, or ENS-resolved address
   * - `undefined` — no result yet; component returns null
   */
  kind: 'tx' | 'address' | undefined
  truncatedHashLength?: number | 'disabled'
}

/**
 * Hash component demo.
 *
 * Some styles were added. Also we show a toast when the copy button is clicked
 * to let the user know that something has happened.
 */
const Hash: FC<Props> = ({ chainId, hash, kind, truncatedHashLength }) => {
  const registry = useChainRegistry()

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

  if (!hash) {
    return null
  }

  const explorerURL =
    chainId !== undefined && kind !== undefined
      ? (getExplorerUrl(
          registry,
          kind === 'tx' ? { chainId, tx: hash } : { chainId, address: hash },
        ) ?? '')
      : ''

  return (
    <BaseHash
      css={{
        '.light &': {
          '--theme-hash-background-color': '#8aebc2',
          '--theme-hash-color': '#2e3048',
        },
        '.dark &': {
          '--theme-hash-background-color': '#1b7b53',
          '--theme-hash-color': '#fff',
        },
      }}
      backgroundColor="var(--theme-hash-background-color)"
      borderRadius="8px"
      color="var(--theme-hash-color)"
      cursor="default"
      explorerURL={explorerURL}
      fontSize="14px"
      hash={hash}
      minHeight="64px"
      minWidth="0"
      onCopy={() => onCopy(hash)}
      paddingTop={8}
      paddingRight={{ base: 2, lg: 4 }}
      paddingBottom={4}
      paddingLeft={{ base: 2, lg: 4 }}
      marginTop={-4}
      showCopyButton
      truncatedHashLength={truncatedHashLength}
    />
  )
}

export default Hash
