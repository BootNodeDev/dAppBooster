import React from 'react'

import BaseHash from '@/app/_components/Hash'
import styles from '@/app/_examples/Hash/styles.module.css'
import { mainnet } from 'viem/chains'

const Balance: React.FC = () => (
  <BaseHash
    childrenStyles={{
      hash: styles.hash,
      copyButton: styles.copyButton,
      linkButton: styles.linkButton,
    }}
    className={styles.wrapper}
    chainId={mainnet.id}
    address="0x6b175474e89094c44da98b954eedeac495271d0f"
  />
)

export default Balance
