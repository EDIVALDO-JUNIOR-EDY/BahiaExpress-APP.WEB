import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// MUDANÇA PRINCIPAL AQUI:
import viteCSP from 'vite-plugin-csp'; // Importa o plugin como padrão (default import)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // E usa o plugin com o novo nome
    viteCSP({
      policies: {
        'script-src': ["'self'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'object-src': ["'none'"],
      }
    })
  ],
})