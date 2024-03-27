import React from 'react'
import styles from '@/app/_examples/Balance/styles.module.css'
import BaseBalance from '@/app/_components/Balance'

const Balance: React.FC = () => (
  <BaseBalance
    className={styles.wrapper}
    childrenStyles={{
      balance: styles.row,
      decimals: styles.row,
      symbol: styles.row,
    }}
  />
)

export default Balance
