import styled from 'styled-components'

import Examples from '@/src/pageComponents/home/Examples'
import WelcomeSection from '@/src/pageComponents/home/WelcomeSection'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-top: calc(var(--base-header-height) * -1);
  position: relative;
`

export const Home = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps}>
      <WelcomeSection />
      <Examples />
    </Wrapper>
  )
}
