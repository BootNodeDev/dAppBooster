import styled from 'styled-components'

import { ButtonCSS } from '@/src/components/pageComponents/home/Welcome/ButtonCSS'
import { SecondaryButton } from '@/src/components/sharedComponents/Buttons'

const Icon = () => (
  <svg fill="none" height="18" viewBox="0 0 16 18" width="16" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.875 12.6562V0.84375C15.875 0.376172 15.4988 0 15.0312 0H3.5C1.63672 0 0.125 1.51172 0.125 3.375V14.625C0.125 16.4883 1.63672 18 3.5 18H15.0312C15.4988 18 15.875 17.6238 15.875 17.1562V16.5938C15.875 16.3301 15.752 16.091 15.5621 15.9363C15.4145 15.3949 15.4145 13.8516 15.5621 13.3102C15.752 13.159 15.875 12.9199 15.875 12.6562ZM4.625 4.71094C4.625 4.59492 4.71992 4.5 4.83594 4.5H12.2891C12.4051 4.5 12.5 4.59492 12.5 4.71094V5.41406C12.5 5.53008 12.4051 5.625 12.2891 5.625H4.83594C4.71992 5.625 4.625 5.53008 4.625 5.41406V4.71094ZM4.625 6.96094C4.625 6.84492 4.71992 6.75 4.83594 6.75H12.2891C12.4051 6.75 12.5 6.84492 12.5 6.96094V7.66406C12.5 7.78008 12.4051 7.875 12.2891 7.875H4.83594C4.71992 7.875 4.625 7.78008 4.625 7.66406V6.96094ZM13.5336 15.75H3.5C2.87773 15.75 2.375 15.2473 2.375 14.625C2.375 14.0063 2.88125 13.5 3.5 13.5H13.5336C13.4668 14.1012 13.4668 15.1488 13.5336 15.75Z"
      fill="currentColor"
    />
  </svg>
)

const Wrapper = styled(SecondaryButton)`
  ${ButtonCSS}
`

const DocsButton = ({ ...restProps }) => {
  return (
    <Wrapper
      as="a"
      href="https://bootnodedev.github.io/dAppBooster/"
      target="_blank"
      {...restProps}
    >
      <Icon />
      Docs
    </Wrapper>
  )
}

export default DocsButton
