'use client'

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode'

export function Provider(props: ColorModeProviderProps) {
  const customConfig = defineConfig({
    globalCss: {
      //////////////////////////////////////////////////
      // Just some basic stuff, don't add too much here.
      //////////////////////////////////////////////////
      ':root': {
        // Font families
        '--base-font-family': '"Manrope", "Arial", "Helvetica Neue", "Helvetica", sans-serif',
        '--base-font-family-code': '"Roboto Mono", "Courier New", monospace',
        // Main container max width
        '--base-container-max-width': '1360px',
        // Transition duration
        '--base-transition-duration-xs': '0.1s',
        '--base-transition-duration-sm': '0.2s',
        '--base-transition-duration': '0.3s',
        '--base-transition-duration-xl': '0.4s',
        '--base-transition-duration-xxl': '0.5s',
      },
      'html.light': {
        // Few basic colors
        '--theme-color-primary': '#692581',
        '--theme-title-color': '#2e3048',
        '--theme-text-color': '#4b4d60',
        // Danger / OK / warning
        '--theme-color-danger': '#800',
        '--theme-color-ok': '#080',
        '--theme-color-warning': '#cc0',
        // Main body
        '--theme-body-background-color': '#e2e0e7',
      },
      'html.dark': {
        // Few basic colors
        '--theme-color-primary': '#8b46a4',
        '--theme-title-color': '#fff',
        '--theme-text-color': '#e2e0e7',
        // Danger / OK / warning
        '--theme-color-danger': '#800',
        '--theme-color-ok': '#080',
        '--theme-color-warning': '#cc0',
        // Main body
        '--theme-body-background-color': '#292b43',
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
