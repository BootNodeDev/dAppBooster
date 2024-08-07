[![dAppBooster Logo](https://dappbooster.dev/share/repo_banner.svg)](https://dappbooster.dev)

# Requirements

- Node v20+
- pnpm
- nvm

# Usage

- Use the recommended node version: `nvm use`
- Install dependencies: `pnpm i`
- Serve dev mode: `pnpm dev`
- Build for production: `pnpm build`
- Serve production build: `pnpm preview`

## Wallet setup

The current setup allows to seamlessly switch between [`connectkit`](#connectkit), [`@rainbow-me/rainbowkit`](#rainbowkit), or [`@web3modal/wagmi`](#web3modal).

We chose `connectkit` because it is open source, lightweight, has easily adaptable styles, and is easy to use.

(\*) The tool used to compare package sizes: [npm-download-size](https://arve0.github.io/npm-download-size)

### Networks

To add/remove/edit a network supported by the dApp you can do it directly in the [`networks.config.ts`](src/lib/networks.config.ts) file.

1. Import the supported network of your choice, say `base`.

```diff
- import { mainnet, optimismSepolia, sepolia } from 'viem/chains'
+ import { base, mainnet, optimismSepolia, sepolia } from 'viem/chains'

...

- export const chains = [mainnet, optimismSepolia, sepolia] as const
+ export const chains = [base, mainnet, optimismSepolia, sepolia] as const

```

2. Include it in the trasports, using the default RPC provided by wagmi/viem...

```diff
export const transports: RestrictedTransports = {
    ...
+   [base.id]: http(env.PUBLIC_RPC_BASE),
}
```

#### Specifying the RPC

If you want to use an RPC different from the one provided by wagmi

1. Define the env variable

```diff
+ PUBLIC_RPC_BASE=https://base.llamarpc.com
```

2. Import it in the [`src/env.ts`](src/env.ts) file

```diff
export const env = createEnv({
  client: {
    ...
+   PUBLIC_RPC_BASE: z.string().optional(),
  },
})
```

> Note: if not specified, it will be `undefined` making the app to use the wagmi-defined RPC.

### Libraries

#### Connectkit

Official docs: [getting started](https://docs.family.co/connectkit/getting-started#getting-started)
<br>
Setup file: [`connectkit.config.tsx`](src/lib/wallets/connectkit.config.tsx)

#### Rainbowkit

Official docs: [installation](https://www.rainbowkit.com/docs/installation)
<br>
Setup file: [`rainbowkit.config.tsx`](src/lib/wallets/rainbowkit.config.tsx)

#### Web3modal

Official docs: [implementation](https://docs.walletconnect.com/web3modal/react/about#implementation)
<br>
Setup file: [`web3modal.config.tsx`](src/lib/wallets/web3modal.config.tsx)

## Number Formatting

We're using a subset of [@uniswap/conedison (v1.8.0)](https://github.com/Uniswap/conedison) formatters.

See [`format.ts`](src/utils/format.ts)

For a detailed view on what to expect or how to use the formatters, you can refer to the tests at [`format.test.ts`](src/utils/format.test.ts)

## TanStack

Currently the app uses @tanstack/react-query, @tanstack/react-router, and @tanstack/react-virtual.

### Devtools

Devtools are not visible in production mode

### @tanstack/react-router

This setup uses file-based routing.

There're a list of scripts to help in the development process:

- serve dev mode (watching for routes changes): `pnpm dev:watch`
- manually generate `routeTree.gen` file: `pnpm routes:generate`

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

> Keeping the following information, for future check as it wasn't used/followed yet

<details>
<summary>Expanding the ESLint configuration</summary>

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
</details>

# UI Libraries / Styles

## Browser Normalizing

We use [modern-normalize](https://github.com/sindresorhus/modern-normalize) to normalize the browsers' default styles.

## Styles

We use [Styled Components](https://styled-components.com/) a popular, powerful, and easy to use CSS-in-JS solution in dAppBoster to add styles to our components.

Additionally, several other Styled Components-related tools are provided to facilitate code maintenance and legibility:

- [Stylelint](https://stylelint.io/), for component linting. The `.stylelintrc` file contains all of Stylelint's related rules. The [official extension](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) is recommended if you're using VSCode (check the "Extension Settings" section if you want errors to be fixed on save, etc.).
- [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard), extends the standard Stylelint configuration.
- [postcss-styled-syntax](https://github.com/hudochenkov/postcss-styled-syntax), parses the components and extracts the CSS from them.

### Styles Implementation details

You can find the general app's styles in the `src/styles` folder:

- [`baseCSSVars.tsx`](src/styles/baseCSSVars.tsx) global CSS vars, used everywhere in the app.
- [`globalStyles.tsx`](src/styles/globalStyles.tsx) global app's CSS.

## Themes

dAppBooster supports themes with the help of [Next Themes](https://github.com/pacocoursey/next-themes)

### Themes implementation

We provide these two themes for your convenience. Generally speaking, you can use these when you can't or don't want to modify a component's source file to add styles.

- [`themes/lightThemeCSSVars.tsx`](src/styles/themes/lightThemeCSSVars.tsx) light theme CSS vars.
- [`themes/darkThemeCSSVars.tsx`](src/styles/themes/darkThemeCSSVars.tsx) dark theme CSS vars.

You can also add CSS theme vars and more in each component's implementation following our examples and Next Themes' documentation.

## Toasts

We use [React Hot Toast](https://github.com/timolins/react-hot-toast)

# Control Version

As a best practice, we follow and enforce the usage of [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) for commit messages' and pull requests' titles.

PR's titles are validated with the help of Github actions. See https://github.com/marketplace/actions/conventional-commit-in-pull-requests for more info.

Commit messages' are validated using a [Husky](https://typicode.github.io/husky/) `commit-msg` hook and [commitlint](https://commitlint.js.org/). See https://commitlint.js.org/guides/local-setup.html for more info.

# Analytics

We use [Vercel Web Analytics](https://vercel.com/docs/analytics).

To start using it, simply [Enable Web Analytics in Vercel](https://vercel.com/docs/analytics/quickstart#enable-web-analytics-in-vercel) within your Vercel project. Everything else is already integrated and ready to go.

# Subgraphs

The app comes with an example of how to configure and use Subgraphs.

This includes multiple subraphs in several chains, typesafe, and easy integration to be used with react-query.

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

## Project structure

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
const parsedResourceIds = parseResourceIds(SUBGRAPHS_CHAINS_RESOURCE_IDS)
const schemas = generateSchemas(parsedResourceIds, SUBGRAPHS_API_KEY, SUBGRAPHS_ENVIRONMENT, {
  development: SUBGRAPHS_DEVELOPMENT_URL,
  production: SUBGRAPHS_PRODUCTION_URL,
})
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

import { graphql } from '@/src/subgraphs/gql/uniswap'

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
`)
```

3. Run the `pnpm subgraph-codegen` script

4. And consume the data in the following way, by using `@tanstack/react-query`:

```ts
import { allUniswapPoolsQueryDocument } from '@/src/subgraphs/queries/uniswap/pools'

const { data } = useSuspenseQuery({
  queryKey: ['allUniswapPools', mainnet.id],
  queryFn: async () => {
    const { positions } = await request(schemas.uniswap[mainnet.id], allUniswapPoolsQueryDocument)
    return positions
  },
})
```

> We use suspense queries as an internal decision, but you can use `useQuery` instead, or any of the query hooks the library provides
