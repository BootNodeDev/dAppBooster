'use client'

import { mainnet } from 'viem/chains'
import { useReadContracts } from 'wagmi'

import { getContractInfo } from '@/app/_constants/contracts'

export default function ERC20BalanceExample() {
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
    <div>
      <p>balance: {balanceOf?.toString()}</p> {/* TODO format */}
      <p>decimals: {decimals}</p>
      <p>symbol: {symbol}</p>
    </div>
  )
}
