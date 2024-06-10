import styled from 'styled-components'

import { ADemoInput } from '@/src/pageComponents/tokens/ADemoInput'

const Wrapper = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

export const Tokens = () => {
  return (
    <Wrapper>
      <h3>Hello from Tokens!</h3>
      <ADemoInput />
    </Wrapper>
  )
}
