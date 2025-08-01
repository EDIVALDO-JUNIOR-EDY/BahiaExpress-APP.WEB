// C:/dev/backend/services/passwordResetService.js

const { db } = require('../firebaseConfig');
const crypto = require('crypto');

// Define a validade do token (1 hora)
const TOKEN_VALIDITY_DURATION = 3600000;

/**
 * Cria um token de reset seguro e o armazena no Firestore com data de validade.
 */
const createResetToken = async (email) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_VALIDITY_DURATION);
    await db.collection('passwordResetTokens').doc(token).set({ email, expiresAt });
    return token;
};

/**
 * Verifica se um token é válido e retorna o e-mail associado.
 */
const verifyResetToken = async (token) => {
    const tokenRef = db.collection('passwordResetTokens').doc(token);
    const doc = await tokenRef.get();
    if (!doc.exists || doc.data().expiresAt.toDate() < new Date()) {
        if (doc.exists) await tokenRef.delete(); // Limpa token expirado
        return null;
    }
    return doc.data().email;
};

/**
 * Deleta um token após o uso bem-sucedido.
 */
const deleteResetToken = async (token) => {
    await db.collection('passwordResetTokens').doc(token).delete();
};

module.exports = {
    createResetToken,
    verifyResetToken,
    deleteResetToken,
};