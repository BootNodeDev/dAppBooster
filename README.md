[![dAppBooster Logo](https://dappbooster.dev/share/repo_banner.svg)](https://dappbooster.dev)

# dAppBooster

![Static Badge](https://img.shields.io/badge/dApp-Booster-green?style=flat&color=%238b46a4)
![GitHub package.json version](https://img.shields.io/github/package-json/v/BootNodeDev/dAppBooster?style=flat&color=%238b46a4) ![GitHub top language](https://img.shields.io/github/languages/top/bootnodedev/dappbooster) ![GitHub branch status](https://img.shields.io/github/checks-status/bootnodedev/dappbooster/main) ![GitHub License](https://img.shields.io/github/license/bootnodedev/dappbooster)

[dAppBooster](https://dappbooster.dev) is a template to help you in the development of blockchain frontend applications. It aims to provide an opinionated set of tools and best practices to speed up the development process and make it more reliable.

Check out the documentation for more information about building your first dApp: [docs.dappbooster.dev](https://docs.dappbooster.dev/)

## Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Development](#development)
5. [Advanced configuration](#advanced-configuration)
6. [Contributing](#contributing)

## Requirements

- Node v20+ from https://nodejs.org/
- pnpm from https://pnpm.io/

## Installation

Ensure you meet all the requirements and then run the install script and follow the on-screen instructions.

```bash
$ pnpm dlx dappbooster dAppName
```

**Note:** you might want to change your project's remote repository to a different one.

```bash
# Change the remote repository
git remote set-url origin
```

## Configuration

### Configuration File

Configure the appropriate settings in the `.env.local` file. Most vars are optional and they should be self-explanatory.

**Note:** You MUST provide a [subgraph API key](https://thegraph.com/studio/apikeys/) if you opted for a subgraph-enabled installation. Also you MUST run the `subgraph-codegen` script after you setup the API key.

```bash
pnpm subgraph-codegen
```

## Development

### Serve dev mode

```bash
pnpm dev
```

You can start modifying the content of the home page by editing `src/components/pageComponents/home/index.tsx`. The page auto-updates as you edit the file.

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
