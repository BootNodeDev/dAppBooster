# dApp👻ster

## Requirements

- Node v20+
- pnpm

## Usage

- install dependencies: `pnpm i`
- serve dev mode: `pnpm dev`
- build for production: `pnpm build`
- serve production build: `pnpm preview`

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
