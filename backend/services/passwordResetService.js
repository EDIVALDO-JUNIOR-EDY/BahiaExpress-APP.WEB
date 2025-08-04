// C:/dev/backend/services/passwordResetService.js
const { db } = require('../firebaseConfig');
const crypto = require('crypto');

const TOKEN_COLLECTION = 'passwordResetTokens';

exports.createResetToken = async (email) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hora

    await db.collection(TOKEN_COLLECTION).doc(token).set({
      email,
      expiry,
      createdAt: new Date()
    });

    console.log(`✅ [PasswordResetService] Token criado para ${email}`);
    return token;
  } catch (error) {
    console.error('❌ [PasswordResetService] Erro ao criar token:', error);
    throw new Error('Falha ao gerar token');
  }
};

exports.verifyResetToken = async (token) => {
  try {
    const tokenDoc = await db.collection(TOKEN_COLLECTION).doc(token).get();

    if (!tokenDoc.exists) {
      console.error('❌ [PasswordResetService] Token não encontrado:', token);
      return null;
    }

    const { email, expiry } = tokenDoc.data();

    if (expiry < Date.now()) {
      console.error('❌ [PasswordResetService] Token expirado:', token);
      await this.deleteResetToken(token);
      return null;
    }

    console.log(`✅ [PasswordResetService] Token válido para ${email}`);
    return email;
  } catch (error) {
    console.error('❌ [PasswordResetService] Erro ao verificar token:', error);
    return null;
  }
};

exports.deleteResetToken = async (token) => {
  try {
    await db.collection(TOKEN_COLLECTION).doc(token).delete();
    console.log(`✅ [PasswordResetService] Token deletado:`, token);
  } catch (error) {
    console.error('❌ [PasswordResetService] Erro ao deletar token:', error);
  }
};