// C:/dev/frontend/src/services/api.js
// VERSÃO 4.0 - TRADUZIDA PARA VITE E CORRIGIDA - Protocolo DEV.SENIOR + Gemini
import axios from 'axios';

// 1. LEITURA DA CONFIGURAÇÃO (SINTAXE VITE)
// =================================================================
// Usamos 'import.meta.env' para ler as variáveis do arquivo .env.local.
// Esta é a forma correta e única de fazer isso em um projeto Vite.
const baseURL = import.meta.env.VITE_API_BASE_URL;

// Diagnóstico de inicialização para garantir que a variável foi carregada.
if (!baseURL) {
  console.error("❌ [API Service] Erro Crítico: A variável VITE_API_BASE_URL não está definida no .env.local. A API não funcionará.");
}

// 2. CRIAÇÃO DA INSTÂNCIA AXIOS
// =================================================================
const api = axios.create({
  baseURL: baseURL, // Ex: 'http://localhost:5000/api'
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. INTERCEPTORS (LÓGICA MANTIDA)
// =================================================================
// Sua lógica de interceptors está ótima e foi mantida.
// Apenas um pequeno ajuste: usar 'api.defaults.baseURL' nos logs para consistência.

// --- INTERCEPTOR DE REQUISIÇÃO (Autenticação) ---
api.interceptors.request.use(
  (config) => {
    // A lógica de pegar o token do Firebase Auth será um pouco diferente,
    // mas por enquanto, deixamos a base com localStorage.
    const token = localStorage.getItem('authToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ [API Request Interceptor] Erro:', error);
    return Promise.reject(error);
  }
);

// --- INTERCEPTOR DE RESPOSTA (Tratamento de Erros) ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log detalhado do erro
    console.error('❌ [API Response Interceptor] Erro na resposta:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Sua lógica de tratamento de erros 401, 403, 500 está ótima.
    if (error.response?.status === 401) {
      console.warn('🚫 [Auth] Token inválido ou expirado. Redirecionando para login.');
      localStorage.removeItem('authToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 500) {
      console.error('💥 [API] Erro interno do servidor. Verifique os logs do backend.');
    }

    return Promise.reject(error);
  }
);


// --- UTILITÁRIO PARA DEBUG (MANTIDO) ---
api.logConfig = () => {
  console.log('🔧 [API] Configuração atual:', {
    baseURL: api.defaults.baseURL,
    timeout: api.defaults.timeout,
    headers: api.defaults.headers
  });
};

// Log inicial para confirmar que o serviço foi carregado corretamente
api.logConfig();

export default api;