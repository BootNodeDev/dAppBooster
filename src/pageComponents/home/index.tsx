import styled from 'styled-components'

import Examples from '@/src/pageComponents/home/Examples'
import Welcome from '@/src/pageComponents/home/Welcome'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-top: calc(var(--base-header-height) * -1);
  position: relative;
  width: 100%;
`

export const Home = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <Welcome />
      <Examples />
    </Wrapper>
  )
}
