import { generateCodegenConfig } from '@bootnodedev/db-subgraph'
import { loadEnv } from 'vite'

const env = loadEnv('subgraphs', process.cwd(), '')

export default generateCodegenConfig({
  subgraphs: [
    {
      apiKey: env.PUBLIC_SUBGRAPHS_API_KEY,
      chainsResourceIds: env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS,
      environment: env.PUBLIC_SUBGRAPHS_ENVIRONMENT as 'development' | 'production',
      productionUrl: env.PUBLIC_SUBGRAPHS_PRODUCTION_URL,
      developmentUrl: env.PUBLIC_SUBGRAPHS_DEVELOPMENT_URL,
    },
  ],
})
