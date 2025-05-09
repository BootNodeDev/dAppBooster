import { Button } from '@/src/components/sharedComponents/ui/Button'
import { type ButtonProps, chakra } from '@chakra-ui/react'
import type { FC } from 'react'
import styles from './styles'

const BaseChevronDown = ({ ...restProps }) => (
  <svg
    fill="none"
    height="7"
    viewBox="0 0 12 7"
    width="12"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>Icon</title>
    <path
      d="M11.3538 1.53372L6.35378 6.53372C6.30735 6.5802 6.2522 6.61708 6.1915 6.64225C6.13081 6.66741 6.06574 6.68036 6.00003 6.68036C5.93433 6.68036 5.86926 6.66741 5.80856 6.64225C5.74786 6.61708 5.69272 6.5802 5.64628 6.53372L0.646284 1.53372C0.552464 1.4399 0.499756 1.31265 0.499756 1.17997C0.499756 1.04728 0.552464 0.920036 0.646284 0.826215C0.740104 0.732395 0.867352 0.679688 1.00003 0.679688C1.13272 0.679688 1.25996 0.732395 1.35378 0.826215L6.00003 5.47309L10.6463 0.826215C10.6927 0.77976 10.7479 0.74291 10.8086 0.717769C10.8693 0.692627 10.9343 0.679688 11 0.679688C11.0657 0.679688 11.1308 0.692627 11.1915 0.717769C11.2522 0.74291 11.3073 0.77976 11.3538 0.826215C11.4002 0.87267 11.4371 0.927821 11.4622 0.988517C11.4874 1.04921 11.5003 1.11427 11.5003 1.17997C11.5003 1.24566 11.4874 1.31072 11.4622 1.37141C11.4371 1.43211 11.4002 1.48726 11.3538 1.53372Z"
      fill="currentColor"
    />
  </svg>
)

const ChevronDown = chakra(BaseChevronDown)

interface ConnectButtonProps extends ButtonProps {
  isConnected?: boolean
}

/**
 * ConnectButton component, a customizable button for connecting or displaying connection status.
 *
 * @param {ConnectButtonProps} props - The props for the ConnectButton component.
 * @param {boolean} [props.isConnected=false] - Indicates if the user is connected. Default is false.
 * @param {React.ReactNode} [props.children] - The content to display inside the button.
 * @param {ButtonProps} [props.restProps] - Additional props inherited from the Button component.
 *
 * @example
 * ```tsx
 * <ConnectButton isConnected={true}>
 *   Connected
 * </ConnectButton>
 * ```
 */
const ConnectButton: FC<ConnectButtonProps> = ({ isConnected, children, css, ...restProps }) => {
  return (
    <Button
      borderRadius={isConnected ? '30px' : 'sm'}
      backgroundColor="var(--background-color)"
      borderColor="var(--border-color)"
      boxShadow="0 2px 4.63px 0 #0000000C, 0 9.6px 13px 0 #00000013, 0 24px 34px 0 #0000001A, 0 48px 80px 0 #00000026"
      color="var(--color)"
      css={{ ...css, ...styles }}
      fontWeight="700"
      height="44px"
      fontSize={{ base: isConnected ? '12px' : '14px', md: isConnected ? '15px' : '16px' }}
      paddingX={isConnected ? 2 : 4}
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
      {...restProps}
    >
      {children}
      {isConnected && (
        <ChevronDown
          marginLeft={2}
          marginRight={2}
          width="auto"
          height="auto"
        />
      )}
    </Button>
  )
}

export default ConnectButton
