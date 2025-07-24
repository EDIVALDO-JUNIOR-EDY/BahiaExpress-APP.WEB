// CÓDIGO COMPLETO PARA SUBSTITUIR EM frontend/src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Suas chaves de configuração do Firebase (lidas do arquivo .env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa o aplicativo Firebase
const app = initializeApp(firebaseConfig);

// Obtém as instâncias dos serviços de Autenticação e Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// LÓGICA DE CONEXÃO COM OS EMULADORES
// A variável `import.meta.env.DEV` é fornecida pelo Vite.
// Ela é `true` apenas quando rodamos o comando `npm run dev`.
if (import.meta.env.DEV) {
  // Conecta ao emulador de Autenticação na porta 9099
  connectAuthEmulator(auth, "http://localhost:9099");
  
  // Conecta ao emulador do Firestore na porta 8080
  connectFirestoreEmulator(db, "localhost", 8080);
  
  console.log("🔥 Conectado aos Emuladores do Firebase (Auth e Firestore)");
}

// Exporta os serviços para serem usados em outras partes do aplicativo
export { auth, db, app };