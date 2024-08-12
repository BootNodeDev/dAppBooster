module.exports = {
  'src/**/*.{ts,tsx}': [
    'prettier --write --ignore-unknown',
    'eslint --fix',
    'stylelint --fix',
    'tsc-files --noEmit',
    'vitest related --run --coverage=false',
  ],
}
