/**
 * This is a codegen script that generates GraphQL clients for each subgraph.
 *
 * It uses the `@graphql-codegen/cli` package to generate the clients.
 * The generated clients are placed in the `src/subgraphs/gql` directory.
 * The script reads the subgraph configurations from the environment variables.
 *
 * The environment variables are:
 * - `PUBLIC_SUBGRAPHS_API_KEY`: The API key for the subgraphs.
 * - `PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS`: The resource IDs for the subgraphs.
 * - `PUBLIC_SUBGRAPHS_DEVELOPMENT_URL`: The development URL for the subgraphs.
 * - `PUBLIC_SUBGRAPHS_PRODUCTION_URL`: The production URL for the subgraphs.
 * - `PUBLIC_SUBGRAPHS_ENVIRONMENT`: The environment for the subgraphs (development or production).
 *
 * The script generates a client for each subgraph and chain combination.
 */

import { CodegenConfig } from '@graphql-codegen/cli'
import { loadEnv } from 'vite'

// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { generateSchemas, parseResourceIds } from '../utils/subgraphs'

const env = loadEnv('subgraphs', process.cwd(), '')

// IMPORTANT: if you miss to explicitly set the env vars, the script will skip the codegen
const SUBGRAPHS_API_KEY = env.PUBLIC_SUBGRAPHS_API_KEY
const SUBGRAPHS_CHAINS_RESOURCE_IDS = env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS
const SUBGRAPHS_DEVELOPMENT_URL = env.PUBLIC_SUBGRAPHS_DEVELOPMENT_URL
const SUBGRAPHS_PRODUCTION_URL = env.PUBLIC_SUBGRAPHS_PRODUCTION_URL
const SUBGRAPHS_ENVIRONMENT = env.PUBLIC_SUBGRAPHS_ENVIRONMENT

/**
 * Builds the configuration object for generating GraphQL clients.
 * @returns The configuration object and the parsed schemas.
 */
const buildConfig = (): CodegenConfig => {
  if (
    !SUBGRAPHS_API_KEY ||
    !SUBGRAPHS_CHAINS_RESOURCE_IDS ||
    !SUBGRAPHS_DEVELOPMENT_URL ||
    !SUBGRAPHS_PRODUCTION_URL ||
    !SUBGRAPHS_ENVIRONMENT
  ) {
    return {
      // this is a silent run
      // does this way so if the env vars are not set, the script does not throw an error
      // and the rest of the app can run
      silent: true,
      generates: {},
    }
  }

  const parsedResourceIds = parseResourceIds(SUBGRAPHS_CHAINS_RESOURCE_IDS)

  const schemas = generateSchemas(parsedResourceIds, SUBGRAPHS_API_KEY, SUBGRAPHS_ENVIRONMENT, {
    development: SUBGRAPHS_DEVELOPMENT_URL,
    production: SUBGRAPHS_PRODUCTION_URL,
  })

  // uncomment to see the generated schemas in the console
  // console.log(JSON.stringify(schemas, null, 2))

  const generates = Object.entries(schemas).reduce(
    (acc, [subgraphId, chains]): CodegenConfig['generates'] => ({
      ...acc,
      [`./src/subgraphs/gql/${subgraphId}/`]: {
        preset: 'client',
        schema: Object.values(chains)[0],
        documents: `src/subgraphs/queries/${subgraphId}/**/*.ts`,
      },
    }),
    {},
  )

  const config: CodegenConfig = {
    overwrite: true,
    generates,
  }

  // uncomment to see the generated config in the console
  // console.log(JSON.stringify(config, null, 2))

  return config
}

const config = buildConfig()

export default config
