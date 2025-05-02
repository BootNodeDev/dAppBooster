import Button from '@/src/components/sharedComponents/ui/Button'
import type { ButtonProps } from '@chakra-ui/react'
import type { FC } from 'react'
import styles from './styles'

export const SecondaryButton: FC<ButtonProps> = ({ css, ...restProps }) => (
  <Button
    backgroundColor="var(--background-color)"
    borderColor="var(--border-color)"
    color="var(--color)"
    css={{ ...css, ...styles }}
    _hover={{
      backgroundColor: 'var(--background-color-hover)',
      borderColor: 'var(--border-color-hover)',
      color: 'var(--color-hover)',
    }}
    _disabled={{
      backgroundColor: 'var(--background-color-disabled)',
      borderColor: 'var(--border-color-disabled)',
      color: 'var(--color-disabled)',
    }}
    fontWeight={500}
    {...restProps}
  />
)

export default SecondaryButton
