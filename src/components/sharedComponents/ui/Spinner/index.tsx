import { Spinner as BaseSpinner, type SpinnerProps } from '@chakra-ui/react'
import type { FC } from 'react'
import styles from './styles'

export const Spinner: FC<SpinnerProps> = ({ css, ...restProps }) => (
  <BaseSpinner
    color="var(--color)"
    css={{
      ...styles,
      ...css,
    }}
    {...restProps}
  />
)

export default Spinner
