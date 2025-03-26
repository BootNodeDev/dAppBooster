/// <reference types="vitest" />
import path from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import Sitemap from 'vite-plugin-sitemap'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    Sitemap({
      hostname: 'https://dappbooster.dev',
    }),
  ],
  envPrefix: 'PUBLIC_',
  resolve: {
    alias: {
      '@/src': path.resolve(__dirname, './src'),
      '@packageJSON': path.resolve(__dirname, 'package.json'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setupTests.ts'],
  },
})
