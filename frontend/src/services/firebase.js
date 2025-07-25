// Em: C:\dev\frontend\src\services\firebase.js
// Este arquivo é o ponto central e único de conexão da sua interface com o Firebase.

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// =========================================================================
// 1. CONFIGURAÇÃO DO PROJETO (O CORAÇÃO DA CONEXÃO)
// =========================================================================
// Lê as credenciais do seu projeto a partir das variáveis de ambiente.
// Esta é a forma 100% segura e correta de fazer isso com Vite.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // APRIMORAMENTO: Adicionando o measurementId para completar a configuração oficial.
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID 
};

// =========================================================================
// 2. VALIDAÇÃO E INICIALIZAÇÃO (GARANTIA DE ROBUSTEZ)
// =========================================================================
// APRIMORAMENTO: Checagem de segurança para garantir que a chave principal foi carregada.
// Isso previne erros silenciosos e ajuda a depurar problemas de configuração.
if (!firebaseConfig.apiKey) {
  throw new Error("VITE_FIREBASE_API_KEY não encontrada! Verifique seu arquivo .env.local ou as configurações de ambiente do servidor.");
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =========================================================================
// 3. CICLO DE DESENVOLVIMENTO: CONEXÃO COM EMULADORES
// =========================================================================
// Esta lógica é a sua funcionalidade mais avançada e foi 100% preservada.
// A variável `import.meta.env.DEV` é `true` apenas com "npm run dev".
// Isso garante que esta seção NUNCA execute em produção (no Render.com).
if (import.meta.env.DEV) {
  const host = import.meta.env.VITE_EMULATOR_HOST;
  const authPort = import.meta.env.VITE_AUTH_EMULATOR_PORT;
  const firestorePort = import.meta.env.VITE_FIRESTORE_EMULATOR_PORT;

  if (host && authPort && firestorePort) {
    try {
      connectAuthEmulator(auth, `http://${host}:${authPort}`);
      connectFirestoreEmulator(db, host, parseInt(firestorePort));
      
      console.log(`🔥 Conectado aos Emuladores Locais do Firebase:
        - Auth: http://${host}:${authPort}
        - Firestore: ${host}:${firestorePort}`);
        
    } catch (error) {
        console.error("Falha ao conectar aos emuladores do Firebase:", error);
    }
  }
}

// =========================================================================
// 4. EXPORTAÇÃO DOS SERVIÇOS
// =========================================================================
// Disponibiliza as instâncias prontas e configuradas para o resto da sua aplicação.
export { auth, db, app };