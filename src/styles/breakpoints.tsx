import { RuleSet } from 'styled-components'

/**
 * CSS media queries can't get their values from CSS variables, so we need to
 * define them here as JS constants.
 */
export const breakpoints = {
  desktopStart: '1025px',
  desktopWideStart: '1281px',
  tabletLandscapeStart: '769px',
  tabletPortraitStart: '481px',
} as const

type Breakpoint = keyof typeof breakpoints

/**
 *
 * @param breakpoint - a breakpoint value, e.g. 'desktopStart'
 * @param css - a CSS rule set
 * @returns string - a media query string
 */
export const breakpointMediaQuery = (breakpoint: Breakpoint, css: RuleSet<object>): string => {
  return `@media (min-width: ${breakpoints[breakpoint]}) {
    ${css}
  }`
}
