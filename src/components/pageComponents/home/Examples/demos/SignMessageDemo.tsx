import styled from 'styled-components'

import SignButtonBase from '@/src/components/sharedComponents/SignButton'
import { PrimaryButton } from '@/src/components/sharedComponents/ui/Buttons'

const message = `
👻🚀 Welcome to dAppBooster! 🚀👻

By signing this message, you acknowledge the awesome power and potential of dAppBooster.

Empower your dApps!

✨ Keep boosting! ✨

dAppBooster Team 💪
`

const Button = styled(PrimaryButton).attrs({ as: SignButtonBase })`
  font-size: 1.6rem;
  font-weight: 500;
  height: 48px;
  padding-left: calc(var(--base-common-padding) * 3);
  padding-right: calc(var(--base-common-padding) * 3);
`

const SignMessageDemo = () => {
  return <Button message={message} />
}

export default SignMessageDemo
