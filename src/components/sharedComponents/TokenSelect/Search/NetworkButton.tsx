import { chakra } from '@chakra-ui/react'
import type { ComponentProps, FC } from 'react'

const ChevronDown = () => (
  <svg
    className="chevronDown"
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Chevron down</title>
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
)

/**
 * A button to select a network from a dropdown
 */
const NetworkButton: FC<ComponentProps<'button'>> = ({ children, ...restProps }) => (
  <chakra.button
    type="button"
    alignItems="center"
    backgroundColor="var(--network-button-background-color)"
    borderRadius={2}
    border="none"
    color="var(--network-button-color)"
    columnGap={2}
    cursor="pointer"
    display="flex"
    justifyContent="center"
    padding={0}
    width="88px"
    _hover={{
      backgroundColor:
        'var(--network-button-background-color-hover, var(--network-button-background-color))',
      color: 'var(--network-button-color-hover, var(--network-button-color))',
    }}
    _active={{
      opacity: 0.7,
    }}
    css={{
      '.chevronDown': {
        transition: 'transform {durations.fast} ease-in-out',
      },
      '&[aria-expanded="true"] .chevronDown': {
        transform: 'rotate(180deg)',
      },
    }}
    {...restProps}
  >
    {children} <ChevronDown />
  </chakra.button>
)

export default NetworkButton
