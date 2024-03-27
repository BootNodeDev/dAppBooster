import { Suspense } from 'react'

import ERC20BalanceExample from '@/app/_examples/BalanceExample'

export default function Home() {
  return (
    <main>
      <h1>Examples</h1>
      <h2>Balance Component</h2>
      <Suspense fallback="Loading...">
        <ERC20BalanceExample />
      </Suspense>
    </main>
  )
}
