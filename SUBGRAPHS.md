# Subgraphs

## Env vars

> [!IMPORTANT]
>
> All env variables must be defined in order to be able to consume the subgraph.

> [!NOTE]
>
> To run the app locally, you can avoid defining the env variables.
>
> A `ELIFECYCLE Command failed with exit code 1.` message will be show on install, but won't affect the app during development. And subgraph example won't be loaded.

> [!WARNING]
>
> However, the build will fail if you don't remove the subgraph example from the example page.

### `PUBLIC_SUBGRAPHS_API_KEY`

The API Key you need to create and retrieve from https://thegraph.com/studio/apikeys/

### `PUBLIC_SUBGRAPHS_<DEVELOPMENT|PRODUCTION>_URL`

A URL with replaceable tokens `[api-key]`, `[subgraph-id]`, and `[resource-id]` that matches the Subgraph URLs requirements.

e.g.:

```shell
PUBLIC_SUBGRAPHS_DEVELOPMENT_URL='https://api.studio.thegraph.com/query/[api-key]/[subgraph-id]/[resource-id]'
PUBLIC_SUBGRAPHS_PRODUCTION_URL='https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/[resource-id]'
```

### `PUBLIC_SUBGRAPHS_ENVIRONMENT`

Values: `development` or `production`

This param matches one of the URLs in the previously explained env var.

It's used to decide which URL will be used to retrieve Subgraphs information.

### `PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS`

Comma separated list of `<chainId>:<subgraphId>:<resourceId>`

e.g.:

```shell
1:uniswap:uniswapResourceIdMainnet,10:aave:aaveResourceIdOptimism
```

## Codegen

This project uses [`@graphql-codegen`](https://the-guild.dev/graphql/codegen/docs/getting-started) to type and ease the consumption of subgraphs.

To be able to generate the files be sure to have all the env variables defined, and run:

```bash
# one-time code generation
# This is ran as part of the `postinstall` hook. So, if you already have
#  the env vars defined, you don't need to run it.
$ pnpm subgraph-codegen

# if you want for the codegen to watch for changes and regenerate the code
$ pnpm subraph-codegen --watch
```

## Subgraph's folder structure

### [`src/subgraphs`](./src/subgraphs/)

Subgraphs in dAppBooster are organized under this directory.

#### [`src/subgraphs/queries`](./src/subgraphs/queries/)

An organized directory whose sub-directories must match `subgraphId` defined in the [chain_resource_ids](#public_subgraphs_chains_resource_ids) env var.

Inside here, you can define individual `.ts` files with `graphql` queries.

#### [`src/subgraphs/codegen.ts`](./src/subgraphs/codegen.ts)

The file that `subgraph-codegen` script will use to generate the code.

#### [`/src/subgraphs/utils/schemas.ts`](./src/subgraphs/utils/schemas.ts)

This file exposes two functions used by `codegen.ts` that allows to organize the data in an easy to consume fashion.

```ts
const parsedResourceIds = parseResourceIds(SUBGRAPHS_CHAINS_RESOURCE_IDS);
const schemas = generateSchemas(
  parsedResourceIds,
  SUBGRAPHS_API_KEY,
  SUBGRAPHS_ENVIRONMENT,
  {
    development: SUBGRAPHS_DEVELOPMENT_URL,
    production: SUBGRAPHS_PRODUCTION_URL,
  }
);
```

> `schemas` is then used by the config to generate diverse subgraphs, grouped by `subgraphId`.

#### `src/subgraphs/gql`

The generated directory, which is not versioned. So if you don't see it, an error may have
happened, you forgot to define all the env variables, or you don't have queries defined.

## Example

1. With a `PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS` defined in the following way:

```shell
PUBLIC_SUBGRAPHS_CHAINS_RESOURCE_IDS=1:uniswap:uniswapResourceIdMainnet,137:uniswap:uniswapResourceIdPolygon,10:aave:aaveResourceIdOptimism
```

2. You need to create two directories, with their respective graphql queries files:

```shell
src/subgraphs/queries/uniswap/
# and
src/subgraphs/queries/aave/
```

An example of a query file inside `uniswap/` directory:

```ts
// pools.ts

import { graphql } from "@/src/subgraphs/gql/uniswap";

export const allUniswapPoolsQueryDocument = graphql(/* GraphQL */ `
  query allUniswapPools {
    positions(first: 3, orderBy: liquidityUSD, orderDirection: asc) {
      id
      pool {
        id
        symbol
      }
    }
  }
`);
```

3. Run the `pnpm subgraph-codegen` script

4. And consume the data in the following way, by using `@tanstack/react-query`:

```ts
import { allUniswapPoolsQueryDocument } from "@/src/subgraphs/queries/uniswap/pools";

const { data } = useSuspenseQuery({
  queryKey: ["allUniswapPools", mainnet.id],
  queryFn: async () => {
    const { positions } = await request(
      schemas.uniswap[mainnet.id],
      allUniswapPoolsQueryDocument
    );
    return positions;
  },
});
```

We use suspense queries as an internal decision, but you can use `useQuery` instead, or any of the query hooks the library provides
