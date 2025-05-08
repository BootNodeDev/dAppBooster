export default {
  'src/**/*.{ts,tsx,js,jsx}': ['biome check --write', 'vitest related --run --coverage=false'],
  'src/**/*.{json,jsonc,mjs,cjs}': ['biome check --write'],
}
