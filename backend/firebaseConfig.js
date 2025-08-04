// C:/dev/backend/firebaseConfig.js
const admin = require('firebase-admin');
const path = require('path');

// --- CÓDIGO APRIMORADO ---
try {
  // Define o caminho do arquivo conforme o ambiente
  const serviceAccountPath = process.env.NODE_ENV === 'production'
    ? '/etc/secrets/serviceAccountKey.json'  // Render
    : path.join(__dirname, 'serviceAccountKey.json'); // Desenvolvimento

  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  // Log de sucesso (CRÍTICO para diagnóstico)
  console.log("✅ [Firebase Admin] SDK inicializado com SUCESSO.");
  console.log("📂 Arquivo de credenciais carregado de:", serviceAccountPath);

} catch (error) {
  // Log detalhado do erro (ESSENCIAL para encontrar a causa-raiz)
  console.error("❌ [Firebase Admin] FALHA CRÍTICA NA INICIALIZAÇÃO!");
  console.error("🔍 Causa do Erro:", error.message);
  console.error("📂 Caminho tentado:", serviceAccountPath);
  
  // Encerra a aplicação se o Firebase não inicializar
  process.exit(1); 
}
// --- FIM DO APRIMORAMENTO ---

const db = admin.firestore();
const auth = admin.auth();
module.exports = { auth, db, admin };