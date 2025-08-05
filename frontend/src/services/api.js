// C:/dev/frontend/src/services/api.js
// VERSÃO 3.9 - OTIMIZADA COM INTERCEPTORS E FLEXIBILIDADE - Protocolo DEV.SENIOR
import axios from 'axios';

// Configuração da baseURL com fallback para múltiplos ambientes
const getBaseURL = () => {
  // 1. Prioridade: variável de ambiente específica da API
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 2. Fallback: construir URL baseada no frontend
  const frontendURL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
  return `${frontendURL}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR DE REQUISIÇÃO (Autenticação) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 [API] Token anexado à requisição: ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ [API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// --- INTERCEPTOR DE RESPOSTA (Tratamento de Erros) ---
api.interceptors.response.use(
  (response) => {
    // Log de sucesso para requisições críticas
    if (response.config.method === 'post' && response.config.url.includes('/auth/')) {
      console.log(`✅ [API] Resposta bem-sucedida: ${response.config.method.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Log detalhado do erro
    console.error('❌ [API] Erro na resposta:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Tratamento específico para erro 401 (Não autorizado)
    if (error.response?.status === 401) {
      console.warn('🚫 [API] Token inválido ou expirado. Deslogando usuário...');
      localStorage.removeItem('authToken');
      
      // Redireciona apenas se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Tratamento para erro 403 (Proibido)
    if (error.response?.status === 403) {
      console.warn('🚫 [API] Acesso proibido. Verifique suas permissões.');
    }

    // Tratamento para erro 500 (Erro do servidor)
    if (error.response?.status === 500) {
      console.error('💥 [API] Erro interno do servidor.');
    }

    return Promise.reject(error);
  }
);

// --- UTILITÁRIO PARA DEBUG ---
api.logConfig = () => {
  console.log('🔧 [API] Configuração atual:', {
    baseURL: api.defaults.baseURL,
    timeout: api.defaults.timeout,
    headers: api.defaults.headers
  });
};

export default api;