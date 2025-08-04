// C:/dev/frontend/src/services/api.js
// VERSÃO FINAL E CORRIGIDA - Protocolo DEV.SENIOR

import axios from 'axios';

// A baseURL agora será lida corretamente do seu arquivo .env.local
const API_URL = import.meta.env.VITE_API_BASE_URL;

console.log(`[API Service] A base da API está configurada para: ${API_URL}`);

// --- INSTÂNCIA DO AXIOS CORRIGIDA ---
const api = axios.create({
  // CORREÇÃO CRÍTICA APLICADA: Adiciona o prefixo /api que o backend espera.
  // Todas as requisições agora serão feitas para, por exemplo, '...onrender.com/api/auth/login'.
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR DE REQUISIÇÃO (Funcionalidade Original Mantida) ---
// Responsabilidade: Anexar o token a cada requisição enviada.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Anexa o cabeçalho de autorização.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Passa o erro de requisição para frente.
    return Promise.reject(error);
  }
);

// --- INTERCEPTOR DE RESPOSTA (Funcionalidade Original Mantida) ---
// Responsabilidade: Lidar com erros de autenticação de forma global.
api.interceptors.response.use(
  // Se a resposta for bem-sucedida (status 2xx), não faz nada e apenas a retorna.
  (response) => {
    return response;
  },
  // Se a resposta resultar em um erro, esta função é acionada.
  (error) => {
    // Verifica se o erro possui uma resposta e um status.
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Erro 401 (Não Autorizado) ou 403 (Proibido) detectado.
      console.error("[API Interceptor] Erro de autenticação detectado (401/403). Deslogando usuário.");

      // AÇÃO GLOBAL: Executa um "logout de emergência".
      localStorage.removeItem('authToken');
      
      // Redireciona o usuário para a página de login.
      if (window.location.pathname !== '/login') {
          window.location.href = '/login';
      }
    }

    // Para todos os outros erros, a promise é rejeitada.
    return Promise.reject(error);
  }
);

export default api;