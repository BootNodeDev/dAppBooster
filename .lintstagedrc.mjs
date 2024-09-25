export default {
  "src/**/*.{ts,tsx}": [
    "stylelint --fix",
    "vitest related --run --coverage=false",
  ],
};
