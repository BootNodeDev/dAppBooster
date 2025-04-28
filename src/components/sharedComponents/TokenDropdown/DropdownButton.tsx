import PrimaryButton from '@/src/components/sharedComponents/ui/PrimaryButton'
import type { ButtonProps } from '@chakra-ui/react'
import type { FC } from 'react'

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

const Button: FC<ButtonProps> = ({ children, ...restProps }) => {
  return (
    <PrimaryButton
      fontSize="16px"
      fontWeight="500"
      height="48px"
      paddingLeft={6}
      paddingRight={6}
      css={{
        '& .chevronDown': {
          transition: 'transform var(--base-transition-duration-xs) ease-in-out',
        },
        '&.isOpen .chevronDown': {
          transform: 'rotate(180deg)',
        },
      }}
      type="button"
      {...restProps}
    >
      {children} <ChevronDown />
    </PrimaryButton>
  )
}

export default Button
