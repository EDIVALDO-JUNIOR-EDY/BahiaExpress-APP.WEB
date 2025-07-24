import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCSP from 'vite-plugin-csp'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteCSP({
      policies: {
        'script-src': ["'self'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'object-src': ["'none'"],
      }
    })
  ],
  build: {
    outDir: 'dist'
  }
})
