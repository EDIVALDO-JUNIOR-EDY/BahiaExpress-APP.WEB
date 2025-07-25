// CÓDIGO COMPLETO E REVISADO para frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Esta seção configura o servidor de desenvolvimento
    // que roda com 'npm run dev'
    headers: {
      // Adiciona um cabeçalho de Content Security Policy (CSP)
      // Esta versão é mais permissiva para evitar bloqueios durante o desenvolvimento
      'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
    }
  }
});