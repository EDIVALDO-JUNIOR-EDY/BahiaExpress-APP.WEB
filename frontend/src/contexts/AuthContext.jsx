// C:/dev/frontend/src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Importar signOut
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import api from '../services/api'; // Importamos a API para poder limpar o token

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged é o "ouvinte" oficial do Firebase para o estado de login
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // --- LÓGICA DE LOGIN ---
        // 1. O usuário está autenticado no Firebase.
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.exists() ? { ...user, ...userDoc.data() } : user;
        
        setCurrentUser(userData);

        // 2. Sincronizamos o token com o localStorage para o 'api.js' usar.
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
        
      } else {
        // --- LÓGICA DE LOGOUT ---
        // 1. O usuário não está autenticado no Firebase.
        setCurrentUser(null);
        // 2. Limpamos o token do localStorage para garantir.
        localStorage.removeItem('authToken');
      }
      setLoading(false);
    });

    // Limpa o ouvinte quando o componente é desmontado
    return unsubscribe;
  }, []);

  // Nova função de logout que podemos chamar de qualquer lugar
  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged irá lidar com a limpeza do estado e do localStorage.
  };

  const value = {
    currentUser,
    setCurrentUser, // Exportando para o Login.jsx poder usar
    loading,
    logout, // Exportando a função de logout
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Não renderiza o app até que o estado inicial de auth seja verificado */}
      {!loading && children}
    </AuthContext.Provider>
  );
}