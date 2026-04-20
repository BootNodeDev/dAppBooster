import { env } from '@/src/env'

/**
 * @source
 */
export const isDev = import.meta.env.DEV

/**
 * @source
 */
export const includeTestnets = env.PUBLIC_INCLUDE_TESTNETS

/** Displayed when no price data is available (e.g. chains unsupported by LI.FI). */
export const NO_PRICE_DATA_LABEL = 'N/A'
