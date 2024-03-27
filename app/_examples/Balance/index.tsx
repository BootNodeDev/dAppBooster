import React from 'react'

import BaseBalance from '@/app/_components/Balance'
import styles from '@/app/_examples/Balance/styles.module.css'

const Balance: React.FC = () => (
  <BaseBalance
    childrenStyles={{
      balance: styles.row,
      decimals: styles.row,
      symbol: styles.row,
    }}
    className={styles.wrapper}
  />
)

export default Balance
