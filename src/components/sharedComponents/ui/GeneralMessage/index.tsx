import { Card as BaseCard, type CardRootProps, Flex, Heading } from '@chakra-ui/react'
import type { ComponentProps, FC, ReactElement } from 'react'
import styles from './styles'

const AlertIcon: FC<ComponentProps<'svg'>> = ({ ...restProps }) => (
  <svg
    fill="none"
    height="80"
    viewBox="0 0 50 50"
    width="80"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>Alert Icon</title>
    <path
      clipRule="evenodd"
      d="M25 3.35187C13.0441 3.35187 3.35187 13.0441 3.35187 25C3.35187 36.9559 13.0441 46.6481 25 46.6481C36.9559 46.6481 46.6481 36.9559 46.6481 25C46.6481 13.0441 36.9559 3.35187 25 3.35187ZM0 25C0 11.1929 11.1929 0 25 0C38.8071 0 50 11.1929 50 25C50 38.8071 38.8071 50 25 50C11.1929 50 0 38.8071 0 25Z"
      fill="currentColor"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M25.0002 13.9944C25.9257 13.9944 26.6761 14.7447 26.6761 15.6703V24.9999C26.6761 25.9255 25.9257 26.6759 25.0002 26.6759C24.0746 26.6759 23.3242 25.9255 23.3242 24.9999V15.6703C23.3242 14.7447 24.0746 13.9944 25.0002 13.9944Z"
      fill="currentColor"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M23.3242 34.3297C23.3242 33.4041 24.0746 32.6538 25.0002 32.6538H25.0235C25.9491 32.6538 26.6994 33.4041 26.6994 34.3297C26.6994 35.2553 25.9491 36.0057 25.0235 36.0057H25.0002C24.0746 36.0057 23.3242 35.2553 23.3242 34.3297Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
)

interface Props extends CardRootProps {
  actionButton?: ReactElement<HTMLButtonElement>
  icon?: ReactElement
  message?: string | ReactElement
  title?: string
}

/**
 * @name GeneralMessage
 *
 * @description General error component.
 *
 * @param {ReactElement<HTMLButtonElement>} [actionButton] - Optional action button. Can be used to reload the page, redirect the user somewhere, etc.
 * @param {Array<ReactElement> | ReactElement} [icon] - Optional icon to display. Default is an alert icon.
 * @param {string | ReactElement} [message] - Optional message to display. Default is 'Something went wrong.'
 * @param {string} [title] - Optional title to display. Default is 'Error'.
 */
export const GeneralMessage: FC<Props> = ({
  actionButton,
  css,
  icon = <AlertIcon />,
  message = 'Something went wrong.',
  title = 'Error',
  ...restProps
}: Props) => {
  return (
    <BaseCard.Root
      alignItems="center"
      backgroundColor="var(--background-color)"
      borderColor="var(--border-color)"
      borderRadius="lg"
      boxShadow="var(--box-shadow)"
      css={{ ...css, ...styles }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      maxWidth="100%"
      pb={8}
      pl={4}
      pr={4}
      pt={8}
      rowGap={4}
      whiteSpace="normal"
      width="400px"
      {...restProps}
    >
      <Flex
        color="var(--color-icon)"
        justifyContent="center"
      >
        {icon}
      </Flex>
      <Heading
        as="h1"
        color="var(--color-title)"
        fontSize="22px"
        fontWeight="700"
        lineHeight="1.2"
        mb={2}
        ml={0}
        mr={0}
        mt={0}
        textAlign="center"
        wordBreak="break-word"
      >
        {title}
      </Heading>
      <Flex
        backgroundColor="var(--color-message-background)"
        flexDirection="column"
        fontSize="16px"
        fontWeight="400"
        lineHeight="1.4"
        maxHeight="250px"
        overflow="auto"
        position="relative"
        width="100%"
        wordBreak="break-word"
        p={4}
        rowGap={2}
        borderRadius="md"
        color="var(--color-text)"
        css={{
          '& p': {
            margin: 0,
            fontSize: 'inherit',
          },
          '& pre': {
            margin: 0,
            fontSize: 'inherit',
          },
        }}
      >
        {message}
      </Flex>
      {actionButton}
    </BaseCard.Root>
  )
}

export default GeneralMessage
