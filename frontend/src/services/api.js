// C:/dev/frontend/src/services/api.js
// VERSÃO APRIMORADA - Protocolo DEV.SENIOR

import axios from 'axios';

// A baseURL agora será lida corretamente do seu arquivo .env.local
const API_URL = import.meta.env.VITE_API_BASE_URL;

console.log(`[API Service] A base da API está configurada para: ${API_URL}`);

const api = axios.create({
  baseURL: API_URL,
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

// --- INTERCEPTOR DE RESPOSTA (NOVA FUNCIONALIDADE CRÍTICA) ---
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
      // Este é o sinal de que o token é inválido, expirado ou ausente.
      console.error("[API Interceptor] Erro de autenticação detectado (401/403). Deslogando usuário.");

      // AÇÃO GLOBAL: Executa um "logout de emergência".
      // 1. Limpa o token do armazenamento local.
      localStorage.removeItem('authToken');
      
      // 2. Redireciona o usuário para a página de login.
      // Usamos 'window.location.href' em vez de 'useNavigate' porque este
      // arquivo é um módulo JavaScript puro, não um componente React.
      // Isso força um recarregamento completo da aplicação, limpando qualquer estado residual.
      if (window.location.pathname !== '/login') {
          window.location.href = '/login';
      }
    }

    // Para todos os outros erros (ex: 500, 404), a promise é rejeitada
    // para que o componente que fez a chamada possa tratar o erro específico.
    return Promise.reject(error);
  }
);

export default api;