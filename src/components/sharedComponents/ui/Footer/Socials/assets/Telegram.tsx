import { chakra } from '@chakra-ui/react'
import type { FC, HTMLAttributes } from 'react'

/**
 * Telegram logo component
 */
const Telegram: FC<HTMLAttributes<SVGElement>> = ({ ...restProps }) => (
  <chakra.svg
    display="block"
    fill="none"
    flexShrink={0}
    height="25px"
    viewBox="0 0 25 25"
    width="25px"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>BootNode Telegram</title>
    <path
      d="M12.3855 0C5.54352 0 0 5.54352 0 12.3855C0 19.2275 5.54352 24.7711 12.3855 24.7711C19.2275 24.7711 24.7711 19.2275 24.7711 12.3855C24.7711 5.54352 19.2275 0 12.3855 0ZM18.4684 8.48509L16.4358 18.0639C16.286 18.7431 15.8814 18.9079 15.3171 18.5883L12.2207 16.306L10.7275 17.7443C10.5627 17.9091 10.4228 18.0489 10.1032 18.0489L10.3229 14.8976L16.0612 9.71365C16.3109 9.49391 16.0063 9.36906 15.6767 9.5888L8.58497 14.0536L5.52854 13.0997C4.86432 12.8899 4.84934 12.4355 5.66838 12.1158L17.6094 7.51123C18.1638 7.31146 18.6482 7.64607 18.4684 8.48509Z"
      fill="currentColor"
    />
  </chakra.svg>
)

export default Telegram
