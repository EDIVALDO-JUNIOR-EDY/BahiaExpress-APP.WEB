// CAMINHO: C:\dev\frontend\src\services\firebase.js
// Este arquivo é o ponto central de conexão da sua interface com os serviços do Firebase.

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// 1. CONFIGURAÇÃO DO PROJETO
// Lê as credenciais do seu projeto Firebase a partir das variáveis de ambiente.
// É a forma correta e segura de fazer isso com Vite.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 2. INICIALIZAÇÃO DOS SERVIÇOS
// Cria a conexão principal com o Firebase e obtém os serviços que usaremos.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. LÓGICA DE CONEXÃO COM EMULADORES (CICLO DE DESENVOLVIMENTO)
// A variável `import.meta.env.DEV` é fornecida pelo Vite e é `true` apenas
// quando rodamos com `npm run dev`. Isso garante que esta lógica NUNCA
// será executada em produção (no Render).
if (import.meta.env.DEV) {
  // Lê as configurações do emulador do nosso arquivo .env.local
  const host = import.meta.env.VITE_EMULATOR_HOST;
  const authPort = import.meta.env.VITE_AUTH_EMULATOR_PORT;
  const firestorePort = parseInt(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT); // Portas devem ser números

  // Validação para garantir que as variáveis foram carregadas
  if (!host || !authPort || !firestorePort) {
    console.error("Variáveis de ambiente dos emuladores não encontradas! Verifique o arquivo .env.local.");
  } else {
    // Conexão com o emulador de Autenticação
    connectAuthEmulator(auth, `http://${host}:${authPort}`);
    
    // Conexão com o emulador do Firestore (usando a porta CORRIGIDA e CENTRALIZADA)
    connectFirestoreEmulator(db, host, firestorePort);
    
    console.log(`🔥 Conectado aos Emuladores do Firebase:
      - Auth: http://${host}:${authPort}
      - Firestore: ${host}:${firestorePort}`);
  }
}

// 4. EXPORTAÇÃO
// Disponibiliza as instâncias dos serviços para o resto da sua aplicação React.
export { auth, db, app };