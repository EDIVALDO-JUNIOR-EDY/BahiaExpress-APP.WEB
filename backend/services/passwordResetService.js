// C:/dev/backend/services/passwordResetService.js
// VERSÃO APRIMORADA COM LOGGING EXPLÍCITO - Protocolo DEV.SENIOR

const { db } = require('../firebaseConfig');
const crypto = require('crypto');

// Define a validade do token (1 hora)
const TOKEN_VALIDITY_DURATION = 3600000;

/**
 * Cria um token de reset seguro e o armazena no Firestore com data de validade.
 */
const createResetToken = async (email) => {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + TOKEN_VALIDITY_DURATION);
        
        await db.collection('passwordResetTokens').doc(token).set({ email, expiresAt });
        
        console.log(`✅ [PasswordResetService] Token de reset criado com sucesso para: ${email}`);
        return token;
    } catch (error) {
        console.error(`❌ [PasswordResetService] Falha ao criar token de reset para: ${email}`);
        console.error(`❌ Causa do Erro do Firestore:`, error);
        throw error; // Re-lança o erro para que o controller possa tratá-lo.
    }
};

/**
 * Verifica se um token é válido e retorna o e-mail associado.
 */
const verifyResetToken = async (token) => {
    try {
        const tokenRef = db.collection('passwordResetTokens').doc(token);
        const doc = await tokenRef.get();

        if (!doc.exists || doc.data().expiresAt.toDate() < new Date()) {
            if (doc.exists) {
                await tokenRef.delete(); // Limpa token expirado
                console.log(`[PasswordResetService] Token expirado foi limpo: ${token.substring(0, 10)}...`);
            }
            return null;
        }
        
        console.log(`✅ [PasswordResetService] Token verificado com sucesso para: ${doc.data().email}`);
        return doc.data().email;
    } catch (error) {
        console.error(`❌ [PasswordResetService] Falha ao verificar o token: ${token.substring(0, 10)}...`);
        console.error(`❌ Causa do Erro do Firestore:`, error);
        throw error;
    }
};

/**
 * Deleta um token após o uso bem-sucedido.
 */
const deleteResetToken = async (token) => {
    try {
        await db.collection('passwordResetTokens').doc(token).delete();
        console.log(`✅ [PasswordResetService] Token usado foi deletado com sucesso: ${token.substring(0, 10)}...`);
    } catch (error) {
        console.error(`❌ [PasswordResetService] Falha ao deletar o token: ${token.substring(0, 10)}...`);
        console.error(`❌ Causa do Erro do Firestore:`, error);
        throw error;
    }
};

module.exports = {
    createResetToken,
    verifyResetToken,
    deleteResetToken,
};