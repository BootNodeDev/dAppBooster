[![dAppBooster Logo](https://dappbooster.dev/share/repo_banner.svg)](https://dappbooster.dev)

# dAppBooster

![Static Badge](https://img.shields.io/badge/dApp-Booster-green?style=flat&color=%238b46a4)
![GitHub package.json version](https://img.shields.io/github/package-json/v/BootNodeDev/dAppBooster?style=flat&color=%238b46a4) ![GitHub top language](https://img.shields.io/github/languages/top/bootnodedev/dappbooster) ![GitHub branch status](https://img.shields.io/github/checks-status/bootnodedev/dappbooster/main) ![GitHub License](https://img.shields.io/github/license/bootnodedev/dappbooster)

[dAppBooster](https://dappbooster.dev) is a template to help you in the development of blockchain frontend applications. It aims to provide an opinionated set of tools and best practices to speed up the development process and make it more reliable.

## Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Development](#development)
5. [Advanced configuration](#advanced-configuration)
6. [Contributing](#contributing)
7. [Tools and libraries](#very-opinionated-list-of-tools-and-libraries)

## Requirements

- Node v20+
- pnpm

## Installation

Ensure `pnpm` is installed (https://pnpm.io/) and clone the repository.

```bash
# Clone the repository
git clone git@github.com:BootNodeDev/dAppBooster.git my-dapp

# Change the directory
cd my-dapp

# Checkout the latest release
git checkout main

# Create a local .env file
cp .env.example .env.local

# Install the dependencies
pnpm i
```

Now you might want to change your project's name and description in the `package.json` file.

```json
{
  "name": "my-dapp",
  "description": "My dApp"
}
```

Also you might want to change your project's remote repository to a different one.

```bash
# Change the remote repository
git remote set-url origin
```

## Configuration

### Configuration File

Configure the appropriate settings in the `.env.local` file. Most vars are optional and they should be self-explanatory.

## Development

### Serve dev mode

```bash
pnpm dev
```

You can start modifying the content of the home page by editing `src/components/pageComponents/home/index.tsx`. The page auto-updates as you edit the file.

You can also modify and see how our Web3 components work in the [demos folder](src/components/pageComponents/home/Examples/demos).

### Build for production

```bash
pnpm build
```

### Serve production build

```bash
pnpm preview
```

## Basic folder structure

- `src/`: Source code
  - `components/`: Reusable components
    - `components/sharedComponents`: Components shared across multiple pages
    - `components/pageComponents`: Components specific to a page
  - `routes/`: TanStack Router routes
  - `styles/`: App styles

## Advanced configuration

### Networks

To add / remove / edit a network supported by the dApp you can do it directly in the [`networks.config.ts`](src/lib/networks.config.ts) file.

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

**Note:** if not specified, it will be `undefined` making the app to use the wagmi-defined RPC.

### Subgraphs

dAppBooster comes with an example of how to configure and use subgraphs.

This includes multiple subraphs in several chains, typesafe, and easy integration to be used with react-query.

Check the subgraphs [`documentation file`](SUBGRAPHS.md) for more information.

### ESLint configuration for production releases

If you are developing a production application, we recommend updating the [configuration file](.eslintrc) to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```cjs
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

- Replace `plugin:@typescript-eslint/recommended` for `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`

## Contributing

If you want to contribute to this project, please read the [contributing guidelines](CONTRIBUTING.md). Issues and pull requests are welcome!

## (Very) opinionated list of tools and libraries

### Vite

[Oficial site](https://vitejs.dev/)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules. It uses [SWC](https://swc.rs/) for fast refresh.

#### React SWC

[Github repository](https://github.com/vitejs/vite-plugin-react-swc)

### TanStack

#### React Query

[Official docs](https://tanstack.com/query/latest)

#### React Virtual

[Official docs](https://tanstack.com/virtual/latest)

#### React Router

[Official docs](https://tanstack.com/router/latest)

Serve dev mode watching for routes changes:

```bash
 pnpm routes:watch
```

Manually generate `routeTree.gen` file:

```bash
 pnpm routes:generate
```

#### Dev tools

Dev tools are not visible in production mode.

### Wallet connection

You should be able to seamlessly switch between several libraries for wallet connection.

#### Connectkit

[Official docs](https://docs.family.co/connectkit/getting-started#getting-started) | [Setup file](src/lib/wallets/connectkit.config.tsx)

#### Rainbowkit

[Official docs](https://www.rainbowkit.com/docs/installation) | [Setup file](src/lib/wallets/rainbowkit.config.tsx)

#### Web3modal

[Official docs](https://docs.walletconnect.com/web3modal/react/about#implementation) | [Setup file](src/lib/wallets/web3modal.config.tsx)

### Number Formatting

#### Conedison

[Github repository](https://github.com/Uniswap/conedison) | [`numberFormat.ts`](src/utils/numberFormat.ts) | [`numberFormat.test.ts`](src/utils/format.test.ts)

### Styles

#### Modern Normalize

[Github repository](https://github.com/sindresorhus/modern-normalize)

#### Styled Components

[Official docs](https://styled-components.com/) | [Global CSS vars](src/styles/baseCSSVars.tsx) | [Global styles](src/styles/globalStyles.tsx)

#### Stylelint

[Official docs](https://stylelint.io/) | [Setup file](.stylelintrc)

The [official extension](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) is recommended if you're using VSCode.

**Note:** check the "Extension Settings" section if you want errors to be fixed on save, etc.

#### Next Themes

[Github repository](https://github.com/pacocoursey/next-themes) | [Light theme CSS vars](src/styles/themes/lightThemeCSSVars.tsx) | [Dark theme CSS vars](src/styles/themes/darkThemeCSSVars.tsx)

### Faceless UI Modal

[Github repository](https://github.com/faceless-ui/modal) | [Official docs](https://facelessui.com/docs/getting-started)

### React Hot Toast

[Github repository](https://github.com/timolins/react-hot-toast)

### Vercel Web Analytics

[Official docs](https://vercel.com/docs/analytics)

Simply [Enable Web Analytics in Vercel](https://vercel.com/docs/analytics/quickstart#enable-web-analytics-in-vercel) within your Vercel project. Everything else is already integrated and ready to go.
