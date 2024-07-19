import { Chain } from 'viem/chains'

type ParsedResourceIds = {
  [subgraphId: string]: {
    [chainId: Chain['id']]: string
  }
}

/**
 * Parses a string of resource IDs and returns an object with the parsed values.
 *
 * @param resourceIds - The string of resource IDs to parse.
 * @returns An object containing the parsed resource IDs.
 *
 * @example
 * parseResourceIds('1:uniswap:3,4:aave:6')
 * // Returns
 * {
 *  'uniswap': { '1': '3' },
 * 'aave': { '4': '6' }
 * }
 */
export const parseResourceIds = (resourceIds: string): ParsedResourceIds =>
  resourceIds
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

/**
 * Generates schemas for subgraphs based on parsed resource IDs.
 *
 * @param parsedResourceIds - The parsed resource IDs.
 * @param apiKey - The API key.
 * @param sgEnvironment - The subgraph environment ('development' or 'production').
 * @param sgUrls - The URLs for the subgraph environment.
 * @returns The generated schemas.
 *
 * @example
 * generateSchemas(parseResourceIds('1:uniswap:3,4:aave:6'), 'apiKey', 'development', {
 *  development: 'https://api.studio.thegraph.com/query/[api-key]/[subgraph-id]/[resource-id]',
 *  production: 'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/[resource-id]'
 * })
'}
 * // Returns
 * {
 *  'uniswap': {
 *   '1': 'https://api.studio.thegraph.com/query/apiKey/subgraphId/resourceId',
 *   '10': 'https://api.studio.thegraph.com/query/apiKey/subgraphId/resourceId,
 *  },
 *  'aave': {
 *   '4': 'https://api.studio.thegraph.com/query/apiKey/subgraphId/resourceId'
 *  }
 * }
 */
export const generateSchemas = (
  parsedResourceIds: ParsedResourceIds,
  apiKey: string,
  sgEnvironment: string,
  sgUrls: {
    development: string
    production: string
  },
) => {
  const url = sgEnvironment === 'development' ? sgUrls.development : sgUrls.production

  return Object.fromEntries(
    Object.entries(parsedResourceIds).map(([subgraphId, chains]) => {
      return [
        subgraphId,
        Object.fromEntries(
          Object.entries(chains).map(([chainId, resourceId]) => {
            return [
              chainId,
              url
                // api-key same to all subgraphs
                .replace('[api-key]', apiKey)
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
}