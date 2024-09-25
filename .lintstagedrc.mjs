export default {
  '*': ['stylelint --fix', 'biome check --write', 'vitest related --run --coverage=false'],
}
