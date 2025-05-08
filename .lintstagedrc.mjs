export default {
  'src/**/*': [
    'biome check --write',
    'vitest related --run --coverage=false',
    'tsc --noEmit --pretty --skipLibCheck --files',
  ],
}
