import Button from '@/src/components/sharedComponents/ui/Button'
import type { ButtonProps } from '@chakra-ui/react'
import type { FC } from 'react'
import css from './styles'

export const SecondaryButton: FC<ButtonProps> = ({ ...restProps }) => (
  <Button
    backgroundColor="var(--theme-button-secondary-background-color)"
    borderColor="var(--theme-button-secondary-border-color)"
    color="var(--theme-button-secondary-color)"
    css={{ ...css }}
    _hover={{
      backgroundColor: 'var(--theme-button-secondary-background-color-hover)',
      borderColor: 'var(--theme-button-secondary-border-color-hover)',
      color: 'var(--theme-button-secondary-color-hover)',
    }}
    _disabled={{
      backgroundColor: 'var(--theme-button-secondary-background-color-disabled)',
      borderColor: 'var(--theme-button-secondary-border-color-disabled)',
      color: 'var(--theme-button-secondary-color-disabled)',
    }}
    fontWeight={500}
    {...restProps}
  />
)

export default SecondaryButton
