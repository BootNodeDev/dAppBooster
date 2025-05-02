import { Link, type LinkProps } from '@chakra-ui/react'
import type { FC } from 'react'
import styles from './styles'

const Button: FC<LinkProps> = ({ css, children, ...restProps }) => (
  <Link
    css={{
      ...styles,
      ...css,
    }}
    backgroundColor="var(--background-color)"
    borderColor="var(--border-color)"
    borderWidth={'1px'}
    borderRadius="4px"
    borderStyle="solid"
    color="var(--color)"
    fontSize="14px"
    fontWeight={500}
    height="43px"
    paddingY={0}
    paddingX={3}
    textDecoration="none"
    transition="background-color {durations.moderate}, border-color {durations.moderate}, color {durations.moderate"
    userSelect="none"
    whiteSpace="nowrap"
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
    _active={{
      opacity: 0.5,
    }}
    {...restProps}
  >
    {children}
  </Link>
)

export default Button
