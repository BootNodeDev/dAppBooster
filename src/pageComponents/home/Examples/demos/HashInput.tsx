import { useState } from 'react'

import { Transaction } from 'viem'
import { mainnet } from 'viem/chains'

import HashInput from '@/src/sharedComponents/HashInput'
import { DetectedHash } from '@/src/utils/hash'

export const HashInputDemo = () => {
  const [searchResult, setSearchResult] = useState<DetectedHash | null>(null)
  return (
    <>
      <HashInput chain={mainnet} onSearch={setSearchResult} />

      {searchResult && searchResult.type === null && <b>No results found</b>}

      {searchResult?.type && (
        <>
          <b>Detected type:</b> {searchResult.type || 'error'}
          {searchResult.type === 'transaction' && (
            <a
              href={`${mainnet.blockExplorers.default.url}/tx/${(searchResult.data as Transaction).hash}`}
              rel="noreferrer"
              target="_blank"
            >
              View on explorer
            </a>
          )}
          {searchResult.type === 'EOA' && (
            <a
              href={`${mainnet.blockExplorers.default.url}/address/${searchResult.data}`}
              rel="noreferrer"
              target="_blank"
            >
              View address
            </a>
          )}
          {searchResult.type === 'contract' && (
            <a
              href={`${mainnet.blockExplorers.default.url}/address/${searchResult.data}`}
              rel="noreferrer"
              target="_blank"
            >
              View contract
            </a>
          )}
          {searchResult.type === 'ENS' && (
            <a
              href={`${mainnet.blockExplorers.default.url}/address/${searchResult.data}`}
              rel="noreferrer"
              target="_blank"
            >
              View ENS address
            </a>
          )}
        </>
      )}
    </>
  )
}
