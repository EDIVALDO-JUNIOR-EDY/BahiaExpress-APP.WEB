// C:/dev/backend/firebaseConfig.js
const admin = require('firebase-admin');

// --- CÓDIGO DE DIAGNÓSTICO A SER ADICIONADO ---
try {
    // Tenta carregar as credenciais. Em produção (Render),
    // o caminho '/etc/secrets/' é onde os "Secret Files" são montados.
    const serviceAccountPath = process.env.NODE_ENV === 'production' 
        ? '/etc/secrets/serviceAccountKey.json' 
        : './serviceAccountKey.json';

    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    // Se chegar aqui, a inicialização foi bem-sucedida.
    console.log("✅ [Firebase Admin] SDK inicializado com SUCESSO.");

} catch (error) {
    // Se o arquivo não for encontrado ou for inválido, este bloco será executado.
    console.error("❌ [Firebase Admin] FALHA CRÍTICA NA INICIALIZAÇÃO DO SDK!");
    console.error("❌ Causa do Erro:", error.message);
    // Encerra a aplicação se o Firebase não puder ser inicializado,
    // pois nada na API irá funcionar.
    process.exit(1); 
}
// --- FIM DO CÓDIGO DE DIAGNÓSTICO ---


const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };