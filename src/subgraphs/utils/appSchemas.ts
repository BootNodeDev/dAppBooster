import { env } from '@/src/env'
import { generateSchemas, parseResourceIds } from '@/src/subgraphs/utils/schemas'

export const appSchemas = generateSchemas(
  parseResourceIds(env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS!),
  env.PUBLIC_SUBGRAPHS_API_KEY!,
  env.PUBLIC_SUBGRAPHS_ENVIRONMENT!,
  {
    development: env.PUBLIC_SUBGRAPHS_DEVELOPMENT_URL!,
    production: env.PUBLIC_SUBGRAPHS_PRODUCTION_URL!,
  },
)
