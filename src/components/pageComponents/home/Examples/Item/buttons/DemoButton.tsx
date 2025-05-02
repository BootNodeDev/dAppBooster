import { Button, type ButtonProps, chakra } from '@chakra-ui/react'
import type { FC } from 'react'

const styles = {
  '.light &': {
    '--background-color': 'transparent',
    '--background-color-hover': '#e8e8e8',
    '--border-color': '#C5C2CB',
    '--border-color-hover': '#C5C2CB',
    '--color': '#2E3048',
    '--color-hover': '#2E3048',
    '--background-color-disabled': 'transparent',
    '--border-color-disabled': '#C5C2CB',
    '--color-disabled': '#2E3048',
  },
  '.dark &': {
    '--background-color': 'transparent',
    '--background-color-hover': '#2E3048',
    '--border-color': '#5F6178',
    '--border-color-hover': '#5F6178',
    '--color': '#E2E0E7',
    '--color-hover': '#E2E0E7',
    '--background-color-disabled': 'transparent',
    '--border-color-disabled': '#5F6178',
    '--color-disabled': '#E2E0E7',
  },
}

const Icon = () => (
  <chakra.svg
    width="11px"
    height="11px"
    viewBox="0 0 12 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Button icon</title>
    <path
      d="M11.0624 1V8.3125C11.0624 8.46168 11.0032 8.60476 10.8977 8.71025C10.7922 8.81574 10.6491 8.875 10.4999 8.875C10.3508 8.875 10.2077 8.81574 10.1022 8.71025C9.99671 8.60476 9.93745 8.46168 9.93745 8.3125V2.35773L1.89792 10.398C1.79237 10.5035 1.64921 10.5628 1.49995 10.5628C1.35068 10.5628 1.20753 10.5035 1.10198 10.398C0.99643 10.2924 0.937134 10.1493 0.937134 10C0.937134 9.85073 0.99643 9.70758 1.10198 9.60203L9.14221 1.5625H3.18745C3.03826 1.5625 2.89519 1.50324 2.7897 1.39775C2.68421 1.29226 2.62495 1.14918 2.62495 1C2.62495 0.850816 2.68421 0.707742 2.7897 0.602253C2.89519 0.496763 3.03826 0.4375 3.18745 0.4375H10.4999C10.6491 0.4375 10.7922 0.496763 10.8977 0.602253C11.0032 0.707742 11.0624 0.850816 11.0624 1Z"
      fill="currentColor"
    />
  </chakra.svg>
)

const DemoButton: FC<ButtonProps> = ({ css, ...restProps }) => (
  <Button
    css={{
      ...styles,
      ...css,
    }}
    backgroundColor="var(--background-color)"
    borderColor="var(--border-color)"
    borderRadius="4px"
    borderWidth={'1px'}
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
    type="button"
    {...restProps}
  >
    Demo <Icon />
  </Button>
)

export default DemoButton
