'use client'

import { Suspense } from 'react'

import { mainnet } from 'viem/chains'
import { useReadContracts } from 'wagmi'

import styles from '@/app/_components/_compoundExamples/Balance/styles.module.css'
import { Item, Wrapper } from '@/app/_components/_ui/Balance'
import { getContractInfo } from '@/app/_constants/contracts'

const Balance: React.FC = () => {
  const daiContractInfo = getContractInfo('DAI', mainnet.id)
  const { data } = useReadContracts({
    contracts: [
      {
        ...daiContractInfo,
        functionName: 'balanceOf',
        args: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
      },
      {
        ...daiContractInfo,
        functionName: 'decimals',
      },
      {
        ...daiContractInfo,
        functionName: 'symbol',
      },
    ],
  })

  if (!data) return <p>Loading...</p>

  const [balanceOf, decimals, symbol] = [data[0]?.result, data[1]?.result, data[2]?.result]

  return (
    <Suspense fallback="Loading...">
      <Wrapper className={styles.wrapper}>
        {/* TODO: Format */}
        <Item className={styles.item}>
          <b>Balance:</b> {balanceOf?.toString()}
        </Item>
        <Item className={styles.item}>
          <b>Decimals:</b> {decimals}
        </Item>
        <Item className={styles.item}>
          <b>Symbol:</b> {symbol}
        </Item>
      </Wrapper>
    </Suspense>
  )
}

export default Balance
