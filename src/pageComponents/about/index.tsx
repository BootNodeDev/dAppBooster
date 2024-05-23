import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`

export const About = () => {
  return (
    <Wrapper>
      <h3>Hello from About!</h3>
    </Wrapper>
  )
}
