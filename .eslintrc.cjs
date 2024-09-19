module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  ignorePatterns: [
    "src/hooks/generated.ts",
    "src/subgraphs/queries/aave",
    "src/subgraphs/queries/uniswap",
    '**/*.css',
    '**/*.html',
    '**/*.scss',
    '.eslintrc.cjs',
    'coverage',
    'dist',
    'dist-ssr',
    'docs',
    'logs',
    'node_modules',
    'src/hooks/generated.ts',
    'src/routeTree.gen.ts',
    'src/subgraphs/gql',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:import/recommended',
    'plugin:eslint-plugin-jsx-a11y/recommended',
    'prettier',
  ],
  plugins: ['react-refresh', 'sort-destructure-keys', 'no-relative-import-paths'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc' },
        groups: [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
        pathGroups: [
          { group: 'builtin', pattern: 'react', position: 'before' },
          {
            group: 'external',
            pattern: '{styled-components,polished,next,next/*,react-dom,sanitize.css}',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'import/named': 'error',
    'import/no-unresolved': 'error',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react',
            importNames: ['default'],
            message: 'Import React specifically, not as the default export.',
          },
        ],
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'MemberExpression[object.name="React"][property.name!="default"]',
        message: 'Use named imports from "react" instead of React.<property>',
      },
    ],
    'no-restricted-globals': [
      'error',
      {
        name: 'React',
        message:
          'Do not use React as a global variable. Import necessary hooks and components individually.',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    "@typescript-eslint/consistent-type-imports": ["error", {
      "prefer": "type-imports"
    }],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
    'jsx-a11y/label-has-associated-control': 'warn',
    'no-constant-binary-expression': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    ],
    'react/jsx-sort-props': 'error',
    'react/jsx-uses-react': 'off',
    'react/no-unescaped-entities': 'off',
    'sort-destructure-keys/sort-destructure-keys': 'error',
    'no-relative-import-paths/no-relative-import-paths': [
      'error',
      { allowSameFolder: false, prefix: '@' },
    ],
  },
}
