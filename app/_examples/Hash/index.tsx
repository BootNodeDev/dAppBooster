import React from 'react'

import { mainnet } from 'viem/chains'

import BaseHash from '@/app/_components/Hash'
import styles from '@/app/_examples/Hash/styles.module.css'

const Balance: React.FC = () => (
  <BaseHash
    address="0x6b175474e89094c44da98b954eedeac495271d0f"
    chainId={mainnet.id}
    childrenStyles={{
      hash: styles.hash,
      copyButton: styles.copyButton,
      linkButton: styles.linkButton,
    }}
    className={styles.wrapper}
  />
)

export default Balance
