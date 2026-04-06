/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import Sitemap from 'vite-plugin-sitemap'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      Sitemap({
        hostname: env.PUBLIC_APP_URL || 'https://demo.dappbooster.dev',
      }),
    ],
    build: {
      sourcemap: mode === 'development' ? 'hidden' : false,
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/'))
              return 'vendor-react'
            if (
              id.includes('node_modules/wagmi') ||
              id.includes('node_modules/@wagmi/') ||
              id.includes('node_modules/viem')
            )
              return 'vendor-wagmi'
            if (
              id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/@tanstack/react-router') ||
              id.includes('node_modules/@tanstack/router-core') ||
              id.includes('node_modules/@tanstack/query-core')
            )
              return 'vendor-tanstack'
            if (id.includes('node_modules/@chakra-ui/')) return 'vendor-chakra'
            if (id.includes('node_modules/@reown/appkit')) return 'vendor-web3'
          },
        },
      },
    },
    envPrefix: 'PUBLIC_',
    resolve: {
      tsconfigPaths: true,
      alias: {
        '@/src': resolve(__dirname, './src'),
        '@packageJSON': resolve(__dirname, 'package.json'),
        buffer: 'buffer/',
      },
    },
    test: {
      environment: 'jsdom',
      exclude: ['**/node_modules/**', '.worktrees/**'],
      globals: true,
      setupFiles: ['./setupTests.ts'],
    },
  }
})
