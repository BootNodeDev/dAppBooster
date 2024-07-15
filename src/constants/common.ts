import { env } from '@/src/env'

export const isDev = import.meta.env.DEV
export const includeTestNets = env.PUBLIC_INCLUDE_TESTNETS
