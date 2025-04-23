import SignButton from '@/src/components/sharedComponents/SignButton'
import { PrimaryButton } from '@/src/components/sharedComponents/ui/Buttons'

const message = `
👻🚀 Welcome to dAppBooster! 🚀👻

By signing this message, you acknowledge the awesome power and potential of dAppBooster.

Empower your dApps!

✨ Keep boosting! ✨

dAppBooster Team 💪
`

const SignMessageDemo = () => {
  return (
    <SignButton
      fontSize="16px"
      fontWeight="500"
      height="48px"
      paddingX={6}
      as={PrimaryButton}
      message={message}
    />
  )
}

export default SignMessageDemo
