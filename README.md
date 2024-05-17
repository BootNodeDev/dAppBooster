# dApp👻ster

## Requirements

- Node v20+
- pnpm

## Usage

- install dependencies: `pnpm i`
- serve dev mode: `pnpm dev`
- build for production: `pnpm build`
- serve production build: `pnpm preview`

## Wallet setup

The current setup allows to seamlessly switch between [`connectkit`](#connectkit), [`@rainbow-me/rainbowkit`](#rainbowkit), or [`@web3modal/wagmi`](#web3modal).

We chose `connectkit` because it is open source, lightweight, has easily adaptable styles, and is easy to use.

<img src="https://github-production-user-asset-6210df.s3.amazonaws.com/3315606/330871787-50443593-fe76-4444-a734-b4a476f317c9.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA/20240517/us-east-1/s3/aws4_request&X-Amz-Date=20240517T144922Z&X-Amz-Expires=300&X-Amz-Signature=73d3ed86b8cd8d93ead25d6aa1ffda15540fb3caa4a885b3fe9be12db9eb459d&X-Amz-SignedHeaders=host&actor_id=3315606&key_id=0&repo_id=773957285" alt="connect kit 3.77MB" />
(*) The tool used to compare package sizes: [npm-download-size](https://arve0.github.io/npm-download-size)

### Networks

To add/remove/edit a network supported by the dApp you can do it directly in the [`networks.config.ts`](src/_lib/networks.config.ts) file.

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
+   [base.id]: http(),
}
```

or you can set your own RPC url if you will:

```diff
export const transports: RestrictedTransports = {
    ...
+   [base.id]: http('https://base.llamarpc.com'),
}
```

### Libraries

#### Connectkit

Official docs: [getting started](https://docs.family.co/connectkit/getting-started#getting-started)
<br>
Setup file: [`connectkit.config.ts`](src/_lib/wallets/connectkit.config.ts)

#### Rainbowkit

Official docs: [installation](https://www.rainbowkit.com/docs/installation)
<br>
Setup file: [`rainbowkit.config.ts`](src/_lib/wallets/rainbowkit.config.ts)

#### Web3modal

Official docs: [implementation](https://docs.walletconnect.com/web3modal/react/about#implementation)
<br>
Setup file: [`web3modal.config.tsx`](src/_lib/wallets/web3modal.config.tsx)

## TanStack

Currently the app uses @tanstack/react-query and @tanstack/react-router.

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
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
</details>
