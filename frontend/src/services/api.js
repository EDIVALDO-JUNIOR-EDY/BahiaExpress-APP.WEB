// C:/dev/frontend/src/services/api.js

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

// Adiciona um interceptor para injetar o token de autenticação em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;