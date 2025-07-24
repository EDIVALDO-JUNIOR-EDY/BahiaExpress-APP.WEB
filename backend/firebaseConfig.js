// ===================================================================
// ARQUIVO DE CONFIGURAÇÃO DO FIREBASE ADMIN SDK PARA O BACKEND
// CAMINHO: C:\dev\backend\firebaseConfig.js
// PROPÓSITO: Este é o "motor" que conecta seu servidor Node.js
// ao Firebase com privilégios de administrador.
// ===================================================================

// 1. IMPORTAÇÃO DAS DEPENDÊNCIAS
const admin = require('firebase-admin'); // A biblioteca de administrador do Firebase
require('dotenv').config();             // A biblioteca para ler o arquivo .env

// 2. VALIDAÇÃO DE SEGURANÇA
// Este é um ciclo de verificação. Antes de prosseguir, o código garante
// que a chave de serviço secreta foi realmente encontrada no arquivo .env.
// Se não encontrar, o servidor para imediatamente com um erro claro.
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error('ERRO CRÍTICO: A variável de ambiente FIREBASE_SERVICE_ACCOUNT não foi encontrada no arquivo .env do backend.');
}

// 3. PROCESSAMENTO DA CREDENCIAL
// O conteúdo da chave de serviço é lido como um texto puro do .env
// e transformado de volta em um objeto JavaScript (JSON.parse).
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Este passo é crucial, especialmente para ambientes como o Render.
// Ele corrige as quebras de linha na chave privada para o formato que o Firebase espera.
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

// 4. INICIALIZAÇÃO DA APLICAÇÃO
// O motor é "ligado". O backend se autentica no Firebase usando a credencial processada.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 5. CRIAÇÃO E EXPORTAÇÃO DOS SERVIÇOS
// Uma vez conectado, criamos instâncias dos serviços que vamos usar (banco de dados e autenticação).
const db = admin.firestore();
const auth = admin.auth();

// Disponibilizamos 'db' e 'auth' para que qualquer outro arquivo do backend
// (como suas rotas) possa usá-los sem precisar se reconectar.
module.exports = { db, auth };