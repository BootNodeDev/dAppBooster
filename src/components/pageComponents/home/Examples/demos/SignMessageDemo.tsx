import SignButton from '@/src/components/sharedComponents/SignButton'
import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'

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
      as={PrimaryButton}
      fontSize="16px"
      fontWeight="500"
      height="48px"
      message={message}
      paddingX={6}
    />
  )
}

export default SignMessageDemo
