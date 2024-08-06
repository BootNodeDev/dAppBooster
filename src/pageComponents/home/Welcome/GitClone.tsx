import { useState } from 'react'
import styled from 'styled-components'

import { Toast, CopyButton } from 'db-ui-toolkit'
import { toast } from 'react-hot-toast'

const CopyIcon = () => (
  <svg fill="none" height="16" viewBox="0 0 17 16" width="17" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.8333 6H7.83333C7.09695 6 6.5 6.59695 6.5 7.33333V13.3333C6.5 14.0697 7.09695 14.6667 7.83333 14.6667H13.8333C14.5697 14.6667 15.1667 14.0697 15.1667 13.3333V7.33333C15.1667 6.59695 14.5697 6 13.8333 6Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.33333"
    />
    <path
      d="M3.83331 9.99998H3.16665C2.81302 9.99998 2.47389 9.8595 2.22384 9.60946C1.97379 9.35941 1.83331 9.02027 1.83331 8.66665V2.66665C1.83331 2.31302 1.97379 1.97389 2.22384 1.72384C2.47389 1.47379 2.81302 1.33331 3.16665 1.33331H9.16665C9.52027 1.33331 9.85941 1.47379 10.1095 1.72384C10.3595 1.97389 10.5 2.31302 10.5 2.66665V3.33331"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.33333"
    />
  </svg>
)

const OkIcon = () => (
  <svg fill="none" height="13" viewBox="0 0 19 13" width="14" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.5 1L6.5 12L1.5 7"
      stroke="#29BD7F"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

const Wrapper = styled.section`
  [data-theme='light'] & {
    --git-clone-background-color: #e2e0e7;
  }

  [data-theme='dark'] & {
    --git-clone-background-color: #292b43;
  }

  align-items: center;
  background-color: var(--git-clone-background-color);
  border-radius: 80px;
  column-gap: calc(var(--base-gap) * 2);
  display: flex;
  height: 50px;
  max-width: 100%;
  padding: 0 calc(var(--base-gap) * 3);
`

const Value = styled.span`
  flex-shrink: 1;
  font-size: 1.6rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const IconWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 17px;
`

const GitClone = ({ ...restProps }) => {
  const [copied, setCopied] = useState(false)
  const cloneString = 'git clone git@github.com:BootNodeDev/dAppBooster.git'

  const handleCopy = () => {
    const timeDelay = 2500
    toast.custom(<Toast>Copied to the clipboard!</Toast>, {
      duration: timeDelay,
      position: 'top-center',
      id: 'copy-to-clipboard',
    })
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  return (
    <Wrapper {...restProps}>
      <Value>{cloneString}</Value>
      <IconWrapper>
        <CopyButton onClick={handleCopy} value={cloneString}>
          {copied ? <OkIcon /> : <CopyIcon />}
        </CopyButton>
      </IconWrapper>
    </Wrapper>
  )
}

export default GitClone
