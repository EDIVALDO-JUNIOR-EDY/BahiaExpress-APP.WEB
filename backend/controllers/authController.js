const { auth, db } = require('../firebaseConfig');
const { sendEmail } = require('../services/emailService');
const {
  createResetToken,
  verifyResetToken,
  deleteResetToken
} = require('../services/passwordResetService');

// Registro de usuário
exports.register = async (req, res) => {
  const { email, password, userType, nome, telefone, ...otherData } = req.body;

  if (!email || !password || !userType || !nome) {
    return res.status(400).send({ message: 'Campos essenciais (email, senha, tipo, nome) são obrigatórios.' });
  }

  // Verifica se o usuário já existe
  try {
    let existingUser;
    try {
      existingUser = await auth.getUserByEmail(email);
    } catch (err) {
      // Se não existe, Firebase lança erro, então ignora
    }
    if (existingUser) {
      return res.status(409).send({ message: 'E-mail já cadastrado.' });
    }

    const userRecord = await auth.createUser({
      email: email,
      password: password,
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

// Solicita recuperação de senha
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email é obrigatório.' });

  // Verifica se usuário existe
  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch (err) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Gera token único e temporário
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

// Redefine a senha usando token
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

    // Busca usuário e atualiza senha
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });

    // Apaga o token após uso
    await deleteResetToken(token);

    return res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
};