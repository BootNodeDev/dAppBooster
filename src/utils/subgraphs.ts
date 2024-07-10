import { Chain } from 'viem/chains'

type ParsedResourceIds = {
  [subgraphId: string]: {
    [chainId: Chain['id']]: string
  }
}

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
