import { chakra } from '@chakra-ui/react'
import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'

const SwitchChainButton = chakra(PrimaryButton, {
  base: {
    fontSize: '16px',
    fontWeight: 500,
    height: '48px',
    paddingLeft: 6,
    paddingRight: 6,
  },
})

export default SwitchChainButton
