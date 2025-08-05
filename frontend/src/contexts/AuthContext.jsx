// C:/dev/frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar token ao carregar
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      api.get('/auth/me')
        .then(response => {
          setCurrentUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { idToken, user } = response.data;
      localStorage.setItem('authToken', idToken);
      setCurrentUser(user);
      return response.data;
    }
    throw new Error(response.data.message);
  };

  const googleLogin = async (idToken) => {
    const response = await api.post('/auth/google-login', { idToken });
    if (response.data.success) {
      const { idToken, user } = response.data;
      localStorage.setItem('authToken', idToken);
      setCurrentUser(user);
      return response.data;
    }
    throw new Error(response.data.message);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    googleLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}