import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { useDialog, GeneralMessage as GeneralMessageBase } from 'db-ui-toolkit'

import { PrimaryButton } from '@/src/sharedComponents/Buttons'
import SignButtonBase from '@/src/sharedComponents/SignButton'

const message = `
👻🚀 Welcome to dAppBooster! 🚀👻

By signing this message, you acknowledge the awesome power and potential of dAppBooster.

Empower your dApps!

✨ Keep boosting! ✨

dAppBooster Team 💪
`

const GeneralMessage = styled(GeneralMessageBase)<{ status?: 'ok' | 'error' }>`
  ${({ status }) =>
    status === 'ok' &&
    css`
      --theme-general-message-icon-color: var(--theme-color-ok);
    `}
`

const Button = styled(PrimaryButton).attrs({ as: SignButtonBase })`
  font-size: 1.6rem;
  font-weight: 500;
  height: 48px;
  padding-left: calc(var(--base-common-padding) * 3);
  padding-right: calc(var(--base-common-padding) * 3);
`

const SignMessageDemo = () => {
  const [state, setState] = useState<{
    signature: string | null
    error: Error | null
  }>({
    error: null,
    signature: null,
  })
  const { Dialog, close, open } = useDialog()

  useEffect(() => {
    if (state.signature || state.error) {
      open('sign-message')
    }
  }, [state.signature, state.error, open])

  const onClose = () => {
    close('sign-message')
    setState({ error: null, signature: null })
  }

  const dialogTitle = state.signature ? 'Success' : state.error ? 'Error' : ''
  const dialogMessage = (
    <>
      {state.signature ? (
        <>
          <b>Signature:</b> {state.signature}
        </>
      ) : state.error ? (
        <pre>{state.error.message}</pre>
      ) : (
        ''
      )}
    </>
  )
  const dialogButton = (
    <PrimaryButton onClick={onClose}>
      {state.signature ? 'Close' : state.error ? 'Try again!' : ''}
    </PrimaryButton>
  )

  return (
    <>
      <Button
        message={message}
        onError={(error) => setState({ error, signature: null })}
        onSign={(signature) => setState({ error: null, signature })}
      />
      <Dialog id="sign-message" onClose={onClose}>
        <GeneralMessage
          actionButton={dialogButton}
          message={dialogMessage}
          status={state.error ? 'error' : 'ok'}
          title={dialogTitle}
        />
      </Dialog>
    </>
  )
}

export default SignMessageDemo
