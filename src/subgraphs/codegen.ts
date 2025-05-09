import { generateCodegenConfig } from '@bootnodedev/db-subgraph'
import { loadEnv } from 'vite'

const env = loadEnv('subgraphs', process.cwd(), '')

/**
 * Generates configuration for subgraph code generation.
 *
 * Creates a configuration object for generating TypeScript types and queries
 * from GraphQL subgraph schemas. Uses environment variables to determine
 * connection settings.
 *
 * @param {Object} options - Configuration options
 * @param {Array<SubgraphConfig>} options.subgraphs - Array of subgraph configuration objects
 * @param {string} options.subgraphs[].apiKey - API key for accessing the subgraph
 * @param {string} options.subgraphs[].chainsResourceIds - Comma-separated chain resource IDs
 * @param {'development'|'production'} options.subgraphs[].environment - Current environment
 * @param {string} options.subgraphs[].productionUrl - URL for production environment
 * @param {string} options.subgraphs[].developmentUrl - URL for development environment
 *
 * @example
 * ```tsx
 * generateCodegenConfig({
 *   subgraphs: [
 *     {
 *       apiKey: process.env.API_KEY,
 *       chainsResourceIds: process.env.CHAIN_IDS,
 *       environment: 'development',
 *       productionUrl: 'https://api.example.com/prod',
 *       developmentUrl: 'https://api.example.com/dev',
 *     },
 *   ],
 * })
 * ```
 */
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
