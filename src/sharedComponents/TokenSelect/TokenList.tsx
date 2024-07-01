import { type FC } from 'react'

import { useTokenSearch } from '@/src/hooks/useTokenSearch'
import Row from '@/src/sharedComponents/TokenSelect/Row'
import SearchTokenInput from '@/src/sharedComponents/TokenSelect/SearchInput'
import VirtualizedList from '@/src/sharedComponents/VirtualizedList'
import { type Token, type Tokens } from '@/src/types/token'

export type TokenListProps = {
  onTokenSelected?: (token: Token) => void
  searchPlaceholder?: string
  tokenList: Tokens
}

const TokenList: FC<TokenListProps> = ({ onTokenSelected, searchPlaceholder, tokenList }) => {
  const { searchResult, searchTerm, setSearchTerm } = useTokenSearch(tokenList)

  return (
    <>
      <SearchTokenInput
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={searchPlaceholder}
        value={searchTerm}
      />
      <VirtualizedList<Token>
        containerHeight={200}
        itemHeight={24}
        items={searchResult}
        renderItem={(item) => <Row onClick={(token) => onTokenSelected?.(token)} token={item} />}
      />
    </>
  )
}

export default TokenList
