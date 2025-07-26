const { auth, db } = require('../firebaseConfig');
const { sendEmail } = require('../services/emailService');

// Registro de usuário
exports.register = async (req, res) => {
  const { email, password, userType, nome, telefone, ...otherData } = req.body;

  if (!email || !password || !userType || !nome) {
    return res.status(400).send({ message: 'Campos essenciais (email, senha, tipo, nome) são obrigatórios.' });
  }

  try {
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

// Recuperação de senha
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email é obrigatório.' });

  try {
    const resetLink = `https://bahiaexpress.com/resetar-senha?token=123456`;

    const enviado = await sendEmail(
      email,
      'Recuperação de Senha - BahiaExpress',
      `Olá! Clique no link abaixo para redefinir sua senha:\n\n${resetLink}`
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
