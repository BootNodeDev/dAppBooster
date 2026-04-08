import { WalletGuard } from '@/src/chakra'
import Icon from '@/src/components/pageComponents/home/Examples/demos/SignMessage/Icon'
import Wrapper from '@/src/components/pageComponents/home/Examples/wrapper'
import { PrimaryButton } from '@/src/core/components'
import { SignButton } from '@/src/transactions/components'

const message = `
👻🚀 Welcome to dAppBooster! 🚀👻

By signing this message, you acknowledge the awesome power and potential of dAppBooster.

Empower your dApps!

✨ Keep boosting! ✨

dAppBooster Team 💪
`

const SignMessage = () => {
  return (
    <WalletGuard>
      <Wrapper title="Sign a message with your connected wallet">
        <p>
          When pressing the button, your connected wallet will display a prompt asking you to sign
          the message.
        </p>
        <SignButton
          as={PrimaryButton}
          fontSize="16px"
          fontWeight="500"
          height="48px"
          message={message}
          paddingX={6}
        />
      </Wrapper>
    </WalletGuard>
  )
}

const signMessage = {
  demo: <SignMessage />,
  href: 'https://bootnodedev.github.io/dAppBooster/variables/components_sharedComponents_SignButton.SignButton.html',
  icon: <Icon />,
  text: 'Sign a message with your wallet and get the signature on a dialog.',
  title: 'Sign button',
}

export default signMessage
