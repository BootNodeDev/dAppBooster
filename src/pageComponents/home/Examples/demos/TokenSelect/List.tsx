import Row from '@/src/pageComponents/home/Examples/demos/TokenSelect/Row'
import VirtualizedList from '@/src/sharedComponents/VirtualizedList'
import { type Token, type Tokens } from '@/src/types/token'
import { withSuspense } from '@/src/utils/suspenseWrapper'

interface Props {
  onTokenSelected?: (token: Token) => void
  tokenList: Tokens
}

const List = withSuspense<Props>(({ onTokenSelected, tokenList, ...restProps }) => {
  return (
    <>
      <VirtualizedList<Token>
        containerHeight={200}
        itemHeight={24}
        items={tokenList}
        renderItem={(item) => <Row onClick={(token) => onTokenSelected?.(token)} token={item} />}
        {...restProps}
      />
    </>
  )
})

export default List
