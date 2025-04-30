import { chakra } from '@chakra-ui/react'

export const Button = chakra(
  'button',
  {
    base: {
      alignItems: 'center',
      borderRadius: 'sm',
      borderStyle: 'solid',
      borderWidth: '1px',
      cursor: 'pointer',
      display: 'flex',
      fontFamily: '{fonts.body}',
      fontSize: '15px',
      fontWeight: '400',
      gap: 2,
      height: '48px',
      justifyContent: 'center',
      lineHeight: '1',
      outline: 'none',
      paddingY: 0,
      paddingX: 4,
      textDecoration: 'none',
      transition:
        'background-color {durations.moderate}, border-color {durations.moderate}, color {durations.moderate',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      _disabled: {
        cursor: 'not-allowed',
        opacity: 0.6,
      },
      _active: {
        opacity: 0.8,
      },
    },
  },
  {
    defaultProps: {
      type: 'button',
    },
  },
)

export default Button
