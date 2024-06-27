import { type FC } from 'react'

import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import SearchTokenInput from '@/src/sharedComponents/Tokens/SearchTokenInput'
import TokenRow from '@/src/sharedComponents/Tokens/TokenRow'
import VirtualizedList from '@/src/sharedComponents/VirtualizedList'
import { type Token, type Tokens } from '@/src/token'

type TokenListProps = {
  searchPlaceholder?: string
  tokenList: Tokens
}

const TokenList: FC<TokenListProps> = ({ searchPlaceholder, tokenList }) => {
  const { searchResult, searchTerm, setSearchTerm } = useTokenSearch(tokenList)

  return (
    <>
      <SearchTokenInput
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        placeholder={searchPlaceholder}
        searchTerm={searchTerm}
      />
      <VirtualizedList<Token>
        containerHeight={200}
        itemHeight={24}
        items={searchResult}
        renderItem={(item) => <TokenRow token={item} />}
      />
    </>
  )
}

export default TokenList