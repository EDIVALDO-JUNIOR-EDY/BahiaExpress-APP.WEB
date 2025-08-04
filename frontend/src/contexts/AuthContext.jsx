// C:/dev/frontend/src/contexts/AuthContext.jsx
// VERSÃO FINAL CORRIGIDA E RECONSTRUÍDA - Protocolo DEV.SENIOR

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// 1. Criação do Contexto de Autenticação
const AuthContext = createContext();

// 2. Hook customizado para facilitar o uso do contexto em outros componentes
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Componente Provedor que encapsula toda a lógica de autenticação
export function AuthProvider({ children }) {
  // Estado para armazenar os dados do usuário logado
  const [currentUser, setCurrentUser] = useState(null);
  
  // Estado para controlar a verificação inicial de autenticação
  const [loading, setLoading] = useState(true);

  // Efeito principal que roda uma vez para configurar o listener de autenticação
  useEffect(() => {
    // onIdTokenChanged é o listener oficial do Firebase que detecta login, logout
    // E, crucialmente, a ATUALIZAÇÃO AUTOMÁTICA DO TOKEN.
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        // --- CICLO DE USUÁRIO LOGADO ---
        // Pega o token mais recente, garantindo que nunca esteja expirado.
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
        
        // Busca dados complementares do Firestore.
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        // Combina os dados do Firebase Auth com os do Firestore.
        const userData = userDoc.exists() ? { ...user, ...userDoc.data() } : user;
        
        setCurrentUser(userData);
      } else {
        // --- CICLO DE USUÁRIO DESLOGADO ---
        setCurrentUser(null);
        localStorage.removeItem('authToken');
      }

      // A verificação inicial foi concluída, a aplicação pode ser renderizada.
      setLoading(false);
    });

    // Função de limpeza: remove o listener quando o componente é desmontado
    return unsubscribe;
  }, []); // O array vazio assegura que o efeito rode apenas na montagem inicial.

  // Função de logout explícita
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // O listener onIdTokenChanged cuidará do resto (limpar estado e localStorage).
    } catch (error) {
      console.error("Erro ao executar logout:", error);
    }
  }, []);

  // Objeto com os valores que serão compartilhados com toda a aplicação
  const value = {
    currentUser,
    setCurrentUser, // Mantido para flexibilidade, como no Login.jsx
    loading,
    logout,
  };

  // O componente retorna o Provedor, que "injeta" o objeto 'value'
  // na árvore de componentes React. A sintaxe aqui está verificada e correta.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}