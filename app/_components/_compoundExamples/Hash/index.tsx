'use client'

import styles from '@/app/_components/_compoundExamples/Hash/styles.module.css'
import { Wrapper, HashValue, ExternalLink, CopyButton } from '@/app/_components/_ui/Hash'
import { truncateStringInTheMiddle } from '@/app/_utils/strings'

interface Props {
  address: string
  onCopy?: () => void
  showCopyButton?: boolean
  explorerURL?: string
}

const Hash: React.FC<Props> = ({ address, explorerURL = '', onCopy, showCopyButton = true }) => {
  return (
    <Wrapper className={styles.wrapper}>
      <HashValue>{truncateStringInTheMiddle(address, 8, 6)}</HashValue>
      {showCopyButton && (
        <CopyButton className={styles.copyButton} onClick={onCopy} value={address} />
      )}
      {explorerURL && <ExternalLink className={styles.externalLink} href={explorerURL} />}
    </Wrapper>
  )
}

export default Hash
