'use client'

import { mainnet } from 'viem/chains'
import { useReadContracts } from 'wagmi'

import { getContractInfo } from '@/app/_constants/contracts'

/**
 * Handles the response data and returns the result.
 * Just an example of how to handle the response data.
 * @template T - The type of the result.
 * @param {any} data - The response data to handle.
 * @returns {T} - The result of the response data.
 * @throws {Error} - If any item in the data array has an error property.
 */
function handleResponseData<T>(data: any) {
  if (Array.isArray(data)) {
    if (data.some((item) => item.error)) {
      throw new Error(data.map((item) => item.error).join('\n'))
    }

    return data.map((item) => item.result) as T
  }
  return data as T
}

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

  const [balanceOf, decimals, symbol] = handleResponseData<[bigint, number, string]>(data)

  return (
    <div>
      <p>balance: {balanceOf?.toString()}</p> {/* TODO format */}
      <p>decimals: {decimals}</p>
      <p>symbol: {symbol}</p>
    </div>
  )
}
