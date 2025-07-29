// C:/dev/frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  /**
   * plugins:
   * Carrega os plugins essenciais para o funcionamento do nosso projeto.
   * '@vitejs/plugin-react' adiciona o suporte para transpilação de JSX,
   * Fast Refresh e outras otimizações específicas do React.
   */
  plugins: [react()],

  /**
   * server:
   * Configura o comportamento do servidor de desenvolvimento.
   * Manter esta seção limpa a menos que haja uma necessidade específica,
   * como configurar um proxy para a API, é a melhor prática.
   * 
   * A configuração de 'headers' foi removida por ser desnecessariamente
   * permissiva para o nosso caso de uso atual.
   */
  server: {
    // Exemplo de configuração útil para o futuro:
    // Se a nossa API estivesse em um domínio diferente e tivéssemos problemas de CORS,
    // poderíamos configurar um proxy aqui.
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5000',
    //     changeOrigin: true,
    //   },
    // },
  },
});
