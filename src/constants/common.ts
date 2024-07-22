import { env } from '@/src/env'

export const isDev = import.meta.env.DEV
export const includeTestNets = env.PUBLIC_INCLUDE_TESTNETS
export const isSubgraphConfigValid = Boolean(
  env.PUBLIC_SUBGRAPHS_API_KEY &&
    env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS &&
    env.PUBLIC_SUBGRAPHS_DEVELOPMENT_URL &&
    env.PUBLIC_SUBGRAPHS_PRODUCTION_URL &&
    env.PUBLIC_SUBGRAPHS_ENVIRONMENT,
)
