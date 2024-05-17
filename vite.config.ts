import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  envPrefix: 'PUBLIC_',
  resolve: {
    alias: {
      '@/src': path.resolve(__dirname, './src'),
    },
  },
})
