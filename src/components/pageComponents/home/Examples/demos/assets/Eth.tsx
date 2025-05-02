import { type HTMLChakraProps, chakra } from '@chakra-ui/react'
import type { FC, SVGAttributes } from 'react'

const Icon: FC<HTMLChakraProps<'svg'> & SVGAttributes<SVGSVGElement>> = ({ ...restProps }) => (
  <chakra.svg
    display="block"
    flexShrink="0"
    fill="none"
    height="24px"
    viewBox="0 0 24 24"
    width="24px"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <title>Icon</title>
    <rect
      fill="#627EEA"
      height="24"
      rx="12"
      width="24"
    />
    <path
      d="M12.3739 2.99829V9.65111L17.9966 12.164L12.3739 2.99829Z"
      fill="white"
      fillOpacity="0.602"
    />
    <path
      d="M12.374 2.99829L6.75122 12.164L12.374 9.65111V2.99829Z"
      fill="white"
    />
    <path
      d="M12.3739 16.4745V20.995L17.9999 13.2104L12.3739 16.4745Z"
      fill="white"
      fillOpacity="0.602"
    />
    <path
      d="M12.374 20.995V16.4745L6.75122 13.2104L12.374 20.995Z"
      fill="white"
    />
    <path
      d="M12.3739 15.4281L17.9966 12.164L12.3739 9.65112V15.4281Z"
      fill="white"
      fillOpacity="0.2"
    />
    <path
      d="M6.75122 12.164L12.374 15.4281V9.65112L6.75122 12.164Z"
      fill="white"
      fillOpacity="0.602"
    />
  </chakra.svg>
)

export default Icon
