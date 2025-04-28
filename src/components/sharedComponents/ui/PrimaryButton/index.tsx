import Button from '@/src/components/sharedComponents/ui/Button'
import type { ButtonProps } from '@chakra-ui/react'
import type { FC } from 'react'
import css from './styles'

export const PrimaryButton: FC<ButtonProps> = ({ ...restProps }) => (
  <Button
    backgroundColor="var(--theme-button-primary-background-color)"
    borderColor="var(--theme-button-primary-border-color)"
    color="var(--theme-button-primary-color)"
    css={{ ...css }}
    _hover={{
      backgroundColor: 'var(--theme-button-primary-background-color-hover)',
      borderColor: 'var(--theme-button-primary-border-color-hover)',
      color: 'var(--theme-button-primary-color-hover)',
    }}
    _disabled={{
      backgroundColor: 'var(--theme-button-primary-background-color-disabled)',
      borderColor: 'var(--theme-button-primary-border-color-disabled)',
      color: 'var(--theme-button-primary-color-disabled)',
    }}
    fontWeight={500}
    {...restProps}
  />
)

export default PrimaryButton
