import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'
import { type ButtonProps, chakra } from '@chakra-ui/react'
import type { FC } from 'react'

const ChevronDown: FC = () => (
  <chakra.svg
    className="chevronDown"
    fill="none"
    height="24px"
    viewBox="0 0 24 24"
    width="24px"
    xmlns="http://www.w3.org/2000/svg"
    transition="transform {durations.fast} ease-in-out"
  >
    <title>Chevron down</title>
    <path
      d="M6 9L12 15L18 9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </chakra.svg>
)

const Button: FC<ButtonProps> = ({ children, ...restProps }) => {
  return (
    <PrimaryButton
      fontSize="16px"
      fontWeight="500"
      height="48px"
      paddingLeft={6}
      paddingRight={6}
      css={{
        '&[aria-expanded="true"] .chevronDown': {
          transform: 'rotate(180deg)',
        },
      }}
      {...restProps}
    >
      {children} <ChevronDown />
    </PrimaryButton>
  )
}

export default Button
