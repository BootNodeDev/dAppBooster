import { type FC, type HTMLAttributes } from 'react'
import { styled } from 'styled-components'

const Wrapper = styled.svg`
  display: block;
  flex-shrink: 0;
`

const Icon: FC<HTMLAttributes<SVGElement>> = ({ ...restProps }) => (
  <Wrapper
    fill="none"
    height="20"
    viewBox="0 0 18 20"
    width="18"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      d="M17.0306 5.71938L11.7806 0.469375C11.7109 0.399749 11.6282 0.344539 11.5371 0.306898C11.4461 0.269257 11.3485 0.249923 11.25 0.25H2.25C1.85218 0.25 1.47064 0.408035 1.18934 0.68934C0.908035 0.970645 0.75 1.35218 0.75 1.75V18.25C0.75 18.6478 0.908035 19.0294 1.18934 19.3107C1.47064 19.592 1.85218 19.75 2.25 19.75H15.75C16.1478 19.75 16.5294 19.592 16.8107 19.3107C17.092 19.0294 17.25 18.6478 17.25 18.25V6.25C17.2501 6.15148 17.2307 6.05391 17.1931 5.96286C17.1555 5.87182 17.1003 5.78908 17.0306 5.71938ZM12 2.81031L14.6897 5.5H12V2.81031ZM15.75 18.25H2.25V1.75H10.5V6.25C10.5 6.44891 10.579 6.63968 10.7197 6.78033C10.8603 6.92098 11.0511 7 11.25 7H15.75V18.25Z"
      fill="currentColor"
    />
  </Wrapper>
)

export default Icon
