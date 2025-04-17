import { generateCodegenConfig } from '@bootnodedev/db-subgraph'
import { loadEnv } from 'vite'

const env = loadEnv('subgraphs', process.cwd(), '')

export default generateCodegenConfig({
  subgraphs: [
    {
      apiKey: env.PUBLIC_SUBGRAPHS_API_KEY,
      chainsResourceIds: env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS,
      environment: 'production',
      productionUrl: env.PUBLIC_SUBGRAPHS_PRODUCTION_URL,
    },
  ],
})
