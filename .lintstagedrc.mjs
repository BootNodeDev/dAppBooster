export default {
  'src/**/*.{ts,tsx,js,jsx}': [
    'biome check --write --no-errors-on-unmatched',
    'vitest related --run --coverage=false',
  ],
  'src/**/*.{json,jsonc,mjs,cjs}': ['biome check --write --no-errors-on-unmatched'],
}
