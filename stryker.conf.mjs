/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'pnpm',
  testRunner: 'vitest',
  testRunnerNodeArgs: ['--experimental-vm-modules'],
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  coverageAnalysis: 'perTest',
  mutate: [
    'src/sdk/core/**/*.ts',
    '!src/sdk/core/**/*.test.ts',
    '!src/sdk/core/**/*.prop.test.ts',
    '!src/sdk/core/**/*.type.test.ts',
    '!src/sdk/core/**/index.ts',
    '!src/sdk/core/testing/**',
  ],
  thresholds: { high: 80, low: 60, break: null },
  vitest: {
    configFile: './vite.config.ts',
  },
}
