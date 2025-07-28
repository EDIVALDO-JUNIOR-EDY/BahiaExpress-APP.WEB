/**
 * Controller de autenticação do backend BahiaExpress.
 * Inclui ciclos completos: registro, login, recuperação/redefinição de senha,
 * logout, validação de token, login Google, perfil, atualização e exclusão.
 */

const { auth, db } = require('../firebaseConfig');
const { sendEmail } = require('../services/emailService');
const {
  createResetToken,
  verifyResetToken,
  deleteResetToken
} = require('../services/passwordResetService');
const fetch = require('node-fetch');

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

/**
 * Registra novo usuário.
 */
exports.register = async (req, res) => {
  const { email, password, userType, nome, telefone, ...otherData } = req.body;
  if (!email || !password || !userType || !nome) {
    return res.status(400).send({ message: 'Campos essenciais (email, senha, tipo, nome) são obrigatórios.' });
  }
  try {
    let existingUser;
    try {
      existingUser = await auth.getUserByEmail(email);
    } catch (err) {}
    if (existingUser) {
      return res.status(409).send({ message: 'E-mail já cadastrado.' });
    }
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: nome,
      disabled: false,
    });
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      userType,
      nome,
      telefone: telefone || null,
      createdAt: new Date(),
      ...otherData
    });
    res.status(201).send({ message: 'Usuário registrado com sucesso!', uid: userRecord.uid });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).send({ message: 'Erro ao registrar usuário', error: error.message });
  }
};

/**
 * Solicita recuperação de senha.
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email é obrigatório.' });
  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch (err) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const token = await createResetToken(email);
    const resetLink = `https://bahiaexpress.com/resetar-senha?token=${token}`;
    const enviado = await sendEmail(
      email,
      'Recuperação de Senha - BahiaExpress',
      `Olá! Clique no link abaixo para redefinir sua senha:\n\n${resetLink}`,
      `<p>Olá! Clique no botão abaixo para redefinir sua senha:</p>
       <a href="${resetLink}" style="background:#007bff;color:#fff;padding:10px 15px;border-radius:4px;text-decoration:none;">Redefinir Senha</a>`
    );
    if (!enviado) {
      return res.status(500).json({ message: 'Erro ao enviar e-mail.' });
    }
    return res.json({ message: 'E-mail de recuperação enviado com sucesso.' });
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

/**
 * Redefinição de senha.
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
  }
  try {
    const email = await verifyResetToken(token);
    if (!email) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });
    await deleteResetToken(token);
    return res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
};

/**
 * Login.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await response.json();
    if (data.error) {
      return res.status(401).json({ message: data.error.message || "Login inválido." });
    }
    return res.json({
      message: "Login bem-sucedido.",
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      localId: data.localId
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ message: 'Erro ao processar login.' });
  }
};

/**
 * Logout (frontend só apaga token, mas pode registrar evento no backend)
 */
exports.logout = async (req, res) => {
  // Aqui pode ser só uma resposta, ou registrar logout no banco se quiser.
  res.json({ message: 'Logout realizado com sucesso' });
};

/**
 * Validação de token (JWT/Firebase)
 */
exports.validateToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Token é obrigatório.' });
  }
  try {
    const decoded = await auth.verifyIdToken(token);
    return res.json({ message: 'Token válido', user: decoded });
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

/**
 * Login com Google OAuth2
 */
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'idToken do Google é obrigatório.' });
  }
  try {
    const decoded = await auth.verifyIdToken(idToken);
    return res.json({ message: 'Login com Google realizado', user: decoded });
  } catch (error) {
    return res.status(401).json({ message: 'Token Google inválido.' });
  }
};

/**
 * Buscar perfil do usuário.
 * @param {string} uid - UID do usuário.
 */
exports.getProfile = async (req, res) => {
  const { uid } = req.params;
  if (!uid) return res.status(400).json({ message: 'UID é obrigatório.' });
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.json(doc.data());
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ message: 'Erro ao buscar perfil.' });
  }
};

/**
 * Atualizar perfil do usuário.
 * @param {string} uid - UID do usuário.
 * @param {...object} updateData - Dados a atualizar.
 */
exports.updateProfile = async (req, res) => {
  const { uid, ...updateData } = req.body;
  if (!uid) return res.status(400).json({ message: 'UID é obrigatório.' });
  try {
    await db.collection('users').doc(uid).update(updateData);
    return res.json({ message: 'Perfil atualizado com sucesso.' });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
};

/**
 * Excluir usuário.
 * @param {string} uid - UID do usuário.
 */
exports.deleteUser = async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ message: 'UID é obrigatório.' });
  try {
    await auth.deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    return res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return res.status(500).json({ message: 'Erro ao excluir usuário.' });
  }
};