// C:/dev/backend/firebaseConfig.js

const admin = require('firebase-admin');

// 1. CARREGAMENTO DAS CREDENCIAIS E INICIALIZAÇÃO DO SDK
// =================================================================
try {
  // A lógica para encontrar o serviceAccountKey.json permanece a mesma.
  // Ela funciona tanto localmente quanto em produção (Render/Vercel).
  const serviceAccountPath = process.env.NODE_ENV === 'production' 
      ? '/etc/secrets/serviceAccountKey.json' 
      : './serviceAccountKey.json';

  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
  });

  console.log("✅ [Firebase Admin] SDK inicializado com sucesso.");

} catch (error) {
  console.error("❌ [Firebase Admin] FALHA CRÍTICA NA INICIALIZAÇÃO DO SDK!");
  console.error("   Causa do Erro:", error.message);
  console.error("   Verifique se o arquivo 'serviceAccountKey.json' existe no caminho esperado e se é um JSON válido.");
  process.exit(1); 
}

// 2. CONEXÃO COM EMULADORES (APENAS EM DESENVOLVIMENTO)
// =================================================================
// Esta é a parte CRÍTICA que estava faltando.
// Verificamos se estamos em modo de desenvolvimento.
if (process.env.NODE_ENV === 'development') {
  console.log("🟠 [Ambiente] Detectado modo de DESENVOLVIMENTO. Tentando conectar aos emuladores...");
  
  // Verifica se a variável de ambiente para o emulador do Firestore está definida.
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    console.log(`   - Redirecionando Firestore para o emulador: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  } else {
    console.warn("   ⚠️ [Firebase] Emulador do Firestore não configurado no .env (FIRESTORE_EMULATOR_HOST). Conectando à produção.");
  }

  // Verifica se a variável de ambiente para o emulador de Autenticação está definida.
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
    console.log(`   - Redirecionando Auth para o emulador: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
  } else {
    console.warn("   ⚠️ [Firebase] Emulador de Autenticação não configurado no .env (FIREBASE_AUTH_EMULATOR_HOST). Conectando à produção.");
  }
} else {
  console.log("🟢 [Ambiente] Detectado modo de PRODUÇÃO. Conectando aos serviços Firebase na nuvem.");
}

// 3. EXPORTAÇÃO DOS SERVIÇOS
// =================================================================
// Agora, 'db' e 'auth' apontarão para os emuladores (em dev) ou para produção.
const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth, admin }; // Exportar 'admin' também é uma boa prática.