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
import { Chain } from 'viem/chains'
import { loadEnv } from 'vite'

const env = loadEnv('subgraphs', process.cwd(), '')

// IMPORTANT: if you miss to explicitly set the env vars, the script will skip the codegen
const SUBGRAPHS_API_KEY = env.PUBLIC_SUBGRAPHS_API_KEY
const SUBGRAPHS_CHAINS_RESOURCE_IDS = env.PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS
const SUBGRAPHS_DEVELOPMENT_URL = env.PUBLIC_SUBGRAPHS_DEVELOPMENT_URL
const SUBGRAPHS_PRODUCTION_URL = env.PUBLIC_SUBGRAPHS_PRODUCTION_URL
const SUBGRAPHS_ENVIRONMENT = env.PUBLIC_SUBGRAPHS_ENVIRONMENT

type ParsedResourceIds = {
  [subgraphId: string]: {
    [chainId: Chain['id']]: string
  }
}

/**
 * Builds the configuration object for generating GraphQL clients.
 * @returns The configuration object and the parsed schemas.
 */
const buildConfig = (): { config: CodegenConfig; schemas: ParsedResourceIds } => {
  if (
    !SUBGRAPHS_API_KEY ||
    !SUBGRAPHS_CHAINS_RESOURCE_IDS ||
    !SUBGRAPHS_DEVELOPMENT_URL ||
    !SUBGRAPHS_PRODUCTION_URL ||
    !SUBGRAPHS_ENVIRONMENT
  ) {
    return {
      config: {
        // this is a silent run
        // does this way so if the env vars are not set, the script does not throw an error
        // and the rest of the app can run
        silent: true,
        generates: {},
      },
      schemas: {},
    }
  }

  const parsedResourceIds: ParsedResourceIds = SUBGRAPHS_CHAINS_RESOURCE_IDS
    // no white spaces allowed
    .replace(/ /g, '')
    // each config
    .split(',')
    .reduce((acc: ParsedResourceIds, config) => {
      const [chainId, subgraphId, resourceId] = config.split(':')

      if (!acc[subgraphId]) {
        acc[subgraphId] = { [chainId]: resourceId }
      } else {
        acc[subgraphId] = { ...acc[subgraphId], [chainId]: resourceId }
      }

      return acc
    }, {})

  const subgraphUrl =
    SUBGRAPHS_ENVIRONMENT === 'development' ? SUBGRAPHS_DEVELOPMENT_URL : SUBGRAPHS_PRODUCTION_URL

  const schemas: ParsedResourceIds = Object.fromEntries(
    Object.entries(parsedResourceIds).map(([subgraphId, chains]) => {
      return [
        subgraphId,
        Object.fromEntries(
          Object.entries(chains).map(([chainId, resourceId]) => {
            return [
              chainId,
              subgraphUrl
                // api-key same to all subgraphs
                .replace('[api-key]', SUBGRAPHS_API_KEY)
                // using group as subgraph id
                .replace('[subgraph-id]', subgraphId)
                // resource-id is unique for each subgraph
                .replace('[resource-id]', resourceId),
            ]
          }),
        ),
      ]
    }),
  )

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

  return { config, schemas }
}

const { config, schemas } = buildConfig()

export { schemas }

export default config
