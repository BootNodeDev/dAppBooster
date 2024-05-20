module.exports = {
  root: true,
  env: { browser: true, es2020: true },
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
  ignorePatterns: ['dist', '.eslintrc.cjs'],
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
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
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
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'multiline-const', next: '*' },
    ],
  },
}
