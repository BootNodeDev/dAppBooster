/// <reference types="vitest" />
import { resolve } from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import Sitemap from 'vite-plugin-sitemap'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    tsconfigPaths(),
    Sitemap({
      hostname: 'https://dappbooster.dev',
    }),
  ],
  envPrefix: 'PUBLIC_',
  resolve: {
    alias: {
      '@/src': resolve(__dirname, './src'),
      '@packageJSON': resolve(__dirname, 'package.json'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setupTests.ts'],
  },
})
