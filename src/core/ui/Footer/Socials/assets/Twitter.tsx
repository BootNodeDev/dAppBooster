import { chakra } from '@chakra-ui/react'
import type { FC, HTMLAttributes } from 'react'

/**
 * Twitter logo component
 */
const Twitter: FC<HTMLAttributes<SVGElement>> = ({ ...restProps }) => (
  <chakra.svg
    display="block"
    fill="none"
    flexShrink={0}
    height="25px"
    viewBox="0 0 26 25"
    width="26px"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>BootNode Twitter / X</title>
    <path
      clipRule="evenodd"
      d="M12.9277 24.7711C19.768 24.7711 25.3132 19.2259 25.3132 12.3855C25.3132 5.54519 19.768 0 12.9277 0C6.08732 0 0.54213 5.54519 0.54213 12.3855C0.54213 19.2259 6.08732 24.7711 12.9277 24.7711ZM20.2113 6H17.7578L13.715 10.154L10.2195 6H5.15688L11.2059 13.11L5.47283 19H7.92775L12.3525 14.4553L16.2196 19H21.1569L14.8512 11.5067L20.2113 6ZM18.2562 17.68H16.8967L8.02194 7.25067H9.4808L18.2562 17.68Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </chakra.svg>
)

export default Twitter
