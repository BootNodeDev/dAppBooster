'use client'

import { mainnet } from 'viem/chains'
import { useReadContracts } from 'wagmi'
import { getContractInfo } from '@/app/_constants/contracts'

interface Props {
  className?: string
  childrenStyles?: {
    balance?: string | React.CSSProperties
    decimals?: string | React.CSSProperties
    symbol?: string | React.CSSProperties
  }
}

const Balance: React.FC<Props> = ({ childrenStyles = {}, className }) => {
  const daiContractInfo = getContractInfo('DAI', mainnet.id)
  const res = useReadContracts({
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

  const [{ result: balanceOf }, { result: decimals }, { result: symbol }] = res.data

  return (
    <ul className={className}>
      {/* TODO: Format */}
      <li className={childrenStyles.balance as string}>
        <b>Balance:</b> {balanceOf?.toString()}
      </li>
      <li className={childrenStyles.decimals as string}>
        <b>Decimals:</b> {decimals}
      </li>
      <li className={childrenStyles.symbol as string}>
        <b>Symbol:</b> {symbol}
      </li>
    </ul>
  )
}

export default Balance
