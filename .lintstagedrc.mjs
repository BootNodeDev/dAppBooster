export default {
  'src/**/*.{js,jsx,ts,tsx,d.ts,json,jsonc}': [
    'biome check --write',
    'vitest related --run --coverage=false',
  ],
}
