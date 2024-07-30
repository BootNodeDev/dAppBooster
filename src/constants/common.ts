import { env } from '@/src/env'

/**
 * @source
 */
export const isDev = import.meta.env.DEV

/**
 * @source
 */
export const includeTestNets = env.PUBLIC_INCLUDE_TESTNETS

/**
 * @source
 */
export const isSubgraphConfigValid = Boolean(
  env.PUBLIC_SUBGRAPHS_API_KEY &&
    env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS &&
    env.PUBLIC_SUBGRAPHS_DEVELOPMENT_URL &&
    env.PUBLIC_SUBGRAPHS_PRODUCTION_URL &&
    env.PUBLIC_SUBGRAPHS_ENVIRONMENT,
)
