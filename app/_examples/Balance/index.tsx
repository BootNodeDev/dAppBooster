import React from 'react'
import { Suspense } from 'react'
import BaseBalance from '@/app/_components/Balance'
import styles from '@/app/_examples/Balance/styles.module.css'

const Balance: React.FC = () => (
  <Suspense fallback="Loading...">
    <BaseBalance
      childrenStyles={{
        balance: styles.row,
        decimals: styles.row,
        symbol: styles.row,
      }}
      className={styles.wrapper}
    />
  </Suspense>
)

export default Balance
