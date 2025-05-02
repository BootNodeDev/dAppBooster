import Dark from '@/src/components/sharedComponents/ui/SwitchThemeButton/assets/Dark'
import Light from '@/src/components/sharedComponents/ui/SwitchThemeButton/assets/Light'
import { Box, type ButtonProps, chakra } from '@chakra-ui/react'
import type { FC } from 'react'
import styles from './styles'

const Icon = chakra('div', {
  base: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    display: 'flex',
    height: 'var(--button-active-state-size)',
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 'var(--button-active-state-size)',
    zIndex: '5',
  },
})

const IconCSS = {
  cursor: 'pointer',
  position: 'relative',
  zIndex: '10',
}

/**
 * @name SwitchThemeButton for dAppBooster
 *
 * @description A button that switches between light and dark themes.
 */
export const SwitchThemeButton: FC<ButtonProps> = ({ onClick, css, ...restProps }) => {
  return (
    <chakra.button
      css={{
        '--button-active-state-size': '36px',
        '--button-left-start': '4px',
        '--button-left-end': '44px',
        _active: {
          '.light & .iconWrapperDark': {
            opacity: '0.5',
          },
          '.dark & .iconWrapperLight': {
            opacity: '0.5',
          },
        },
        ...css,
        ...styles,
      }}
      backgroundColor="var(--background-color)"
      borderRadius="40px"
      border="none"
      boxShadow="0 2px 4.63px 0 #0000000C, 0 9.6px 13px 0 #00000013, 0 24px 34px 0 #0000001A, 0 48px 80px 0 #00000026"
      height="44px"
      padding="4px 12px"
      position="relative"
      transition="background-color {durations.slow} ease-in-out, border-color {durations.moderate} ease-in-out"
      width="84px"
      onClick={onClick}
      {...restProps}
    >
      <Icon
        left="var(--button-left-start)"
        css={{
          '.light &': {
            cursor: 'pointer',
          },
        }}
        className="iconWrapperDark"
      >
        <Dark
          {...IconCSS}
          css={{
            '.dark &': {
              animation: 'rotateSwitch {durations.slow} linear',
              cursor: 'default',
              path: {
                transition: 'fill {durations.slow} ease-in-out',
              },
            },
          }}
        />
      </Icon>
      <Icon
        left="var(--button-left-end)"
        css={{
          '.dark &': {
            cursor: 'pointer',
          },
        }}
        className="iconWrapperLight"
      >
        <Light
          {...IconCSS}
          css={{
            '.light &': {
              animation: 'rotateSwitch {durations.slow} linear',
              cursor: 'default',
              path: {
                transition: 'fill {durations.slow} ease-in-out',
              },
            },
          }}
        />
      </Icon>
      <Box
        borderRadius="50%"
        backgroundColor="var(--theme-active-state-background-color, #8b46a4)"
        height="var(--button-active-state-size)"
        position="absolute"
        top="50%"
        transform="translateY(-50%)"
        left="var(--button-active-state-left)"
        transition="left {durations.slow} ease-in-out"
        width="var(--button-active-state-size)"
        zIndex={1}
      />
    </chakra.button>
  )
}

export default SwitchThemeButton
