'use client'

import { Copy } from '@/app/_components/Hash/assets/Copy'
import { Link } from '@/app/_components/Hash/assets/Link'
import { ChainKeys } from '@/app/_lib/wagmi.config'
import { getExplorerUrl } from '@/app/_utils/getExplorerUrl'
import { truncateStringInTheMiddle } from '@/app/_utils/strings'

interface Props {
  address: string
  chainId: ChainKeys
  childrenStyles?: {
    copyButton?: string | React.CSSProperties
    hash?: string | React.CSSProperties
    linkButton?: string | React.CSSProperties
  }
  className?: string
  onCopy?: () => void
  showCopyButton?: boolean
  showExternalLink?: boolean
}

const Hash: React.FC<Props> = ({
  address,
  chainId,
  childrenStyles = {},
  className,
  onCopy,
  showCopyButton = true,
  showExternalLink = true,
}) => {
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    onCopy && onCopy()
  }

  const explorerUrl = getExplorerUrl(chainId, address)

  return (
    <div className={className}>
      <span className={childrenStyles.hash as string}>
        {truncateStringInTheMiddle(address, 8, 6)}
      </span>
      {showCopyButton && (
        <button
          className={childrenStyles.copyButton as string}
          onClick={() => copyAddress(address)}
        >
          <Copy />
        </button>
      )}
      {showExternalLink && (
        <a className={childrenStyles.linkButton as string} href={explorerUrl} target="_blank">
          <Link />
        </a>
      )}
    </div>
  )
}

export default Hash
