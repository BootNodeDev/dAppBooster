import { useState } from 'react'
import styled from 'styled-components'

import SignButton from '@/src/sharedComponents/Web3Buttons/SignButton'

const message = `
👻🚀 Welcome to dAppBooster! 🚀👻

By signing this message, you acknowledge the awesome power and potential of dAppBooster.

Empower your dApps with us!

✨ Keep boosting! ✨

dAppBooster Team 💪
`

const WrapperOverflow = styled.div`
  max-width: 100%;
  overflow: auto;
  padding: 1rem;
  white-space: pre-wrap;
`

export const SignMessageDemo = () => {
  const [state, setState] = useState<{
    signature: string | null
    error: Error | null
  }>({
    signature: null,
    error: null,
  })

  return (
    <WrapperOverflow>
      <SignButton
        message={message}
        onError={(error) => setState({ error, signature: null })}
        onSign={(signature) => setState({ error: null, signature })}
      />
      {state.signature && <p>Signature: {state.signature}</p>}
      {state.error && <p>Error: {state.error.message}</p>}
    </WrapperOverflow>
  )
}
