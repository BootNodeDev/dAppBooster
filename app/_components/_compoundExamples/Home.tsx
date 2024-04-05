'use client'

import { mainnet } from 'viem/chains'

import ERC20Balance from '@/app/_components/_compoundExamples/Balance'
import Hash from '@/app/_components/_compoundExamples/Hash'
import { getExplorerUrl } from '@/app/_utils/getExplorerUrl'

export default function Home() {
  const address = '0x6b175474e89094c44da98b954eedeac495271d0f'

  return (
    <main>
      <h1>Examples</h1>
      <h2>Balance Component</h2>
      <ERC20Balance />
      <h2>Hash Component</h2>
      <Hash
        address={address}
        explorerURL={getExplorerUrl(mainnet.id, address)}
        onCopy={() => console.log('Address copied to the clipboard!')}
      />
    </main>
  )
}
