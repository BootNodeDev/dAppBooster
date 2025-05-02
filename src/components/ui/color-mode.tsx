'use client'

import { ThemeProvider, type ThemeProviderProps } from 'next-themes'

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider
      defaultTheme="dark"
      attribute="class"
      disableTransitionOnChange
      {...props}
    />
  )
}
