export default {
  'src/**/*.{ts,tsx}': [
    'prettier --write --ignore-unknown',
    'eslint --fix',
    'stylelint --fix',
    'vitest related --run --coverage=false',
  ],
}
