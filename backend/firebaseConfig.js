// C:/dev/backend/firebaseConfig.js

// ===================================================================
// ARQUIVO DE CONFIGURAÇÃO DO FIREBASE ADMIN SDK PARA O BACKEND
// Esta é a forma PADRÃO e RECOMENDADA de inicializar o Admin SDK.
// ===================================================================

// 1. IMPORTAÇÃO DAS DEPENDÊNCIAS
const admin = require('firebase-admin');

// 2. CARREGAMENTO DIRETO DA CREDENCIAL
// O Node.js lê e interpreta o arquivo JSON nativamente.
// Esta abordagem é mais segura, mais simples e menos propensa a erros de formatação.
// Pré-requisito: O arquivo 'serviceAccountKey.json' deve estar na mesma pasta.
const serviceAccount = require('./serviceAccountKey.json');

// 3. INICIALIZAÇÃO DA APLICAÇÃO
// O motor é "ligado" usando a credencial importada diretamente.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 4. CRIAÇÃO E EXPORTAÇÃO DOS SERVIÇOS
// Uma vez conectado, disponibilizamos os serviços para o resto da aplicação.
const db = admin.firestore();
const auth = admin.auth();

module.exports = { auth, db, admin };