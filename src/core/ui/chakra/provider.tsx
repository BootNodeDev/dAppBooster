'use client'

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode'

export function Provider(props: ColorModeProviderProps) {
  const customConfig = defineConfig({
    theme: {
      // Use tokens for values that don't change with light / dark themes
      tokens: {
        fonts: {
          body: {
            value: '"Manrope", "Arial", "Helvetica Neue", "Helvetica", sans-serif',
          },
          heading: {
            value: '{fonts.body}',
          },
          mono: {
            value: '"Roboto Mono", "Courier New", monospace',
          },
        },
      },
      // Use semantic tokens for light / dark values
      semanticTokens: {
        colors: {
          bg: {
            default: {
              value: {
                _light: '#f7f7f7',
                _dark: '#292B43',
              },
            },
            emphasized: {
              value: {
                _light: '#ccc',
                _dark: '#888',
              },
            },
          },
          primary: {
            default: {
              value: {
                _light: '#692581',
                _dark: '#8b46a4',
              },
            },
          },
          text: {
            default: {
              value: {
                _light: '#4b4d60',
                _dark: '#e2e0e7',
              },
            },
          },
          danger: {
            default: {
              value: {
                _light: '#800',
                _dark: '#800',
              },
            },
          },
          ok: {
            default: {
              value: {
                _light: '#080',
                _dark: '#080',
              },
            },
          },
          warning: {
            default: {
              value: {
                _light: '#cc0',
                _dark: '#cc0',
              },
            },
          },
        },
      },
      // Some custom animations
      keyframes: {
        rotateSwitch: {
          from: {
            transform: 'rotate(0)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
      },
    },
    globalCss: {
      //////////////////////////////////////////////////
      // Just some basic stuff, don't add too much here.
      //////////////////////////////////////////////////
      html: {
        scrollBehavior: 'smooth',
        overflowX: 'hidden',
      },
      body: {
        '--moz-osx-font-smoothing': 'grayscale',
        '--webkit-font-smoothing': 'antialiased',
        background: '{colors.bg.default}',
        backgroundPosition: '100% 0',
        backgroundRepeat: 'no-repeat',
        color: '{colors.text.default}',
        fontFamily: '{fonts.body}',
        lineHeight: 1.5,
        outlineColor: '{colors.text.default}',
        overflowX: 'hidden',
      },
      code: {
        fontFamily: '{fonts.mono}',
      },
      a: {
        color: '{colors.primary.default}',
      },
      img: {
        display: 'block',
        maxInlineSize: '100%',
      },
    },
  })

  const system = createSystem(defaultConfig, customConfig)

  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
