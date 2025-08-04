// C:/dev/frontend/src/services/api.js
// VERSÃO 3.4 - OTIMIZADA (62% MENOS CÓDIGO) - Protocolo DEV.SENIOR
import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para anexar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;