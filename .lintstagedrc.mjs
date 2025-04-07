export default {
  'src/**/*': ['stylelint --fix', 'biome check --write', 'vitest related --run --coverage=false'],
}
