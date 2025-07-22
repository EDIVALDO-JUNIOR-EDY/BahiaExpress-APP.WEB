// C:\dev\BAHIAEXPRES1.4\BAHIA_EXPRESS_PRO\backend\firebaseConfig.js

const admin = require('firebase-admin');
require('dotenv').config(); // Carrega as variáveis do arquivo .env

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT não está definida no arquivo .env');
}

// Analisa a string JSON do .env para um objeto
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Corrige as quebras de linha da private_key para o formato que o Firebase espera
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };