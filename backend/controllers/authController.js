// backend/controllers/authController.js

const { auth, db } = require('../firebaseConfig');
const { sendEmail } = require('../services/emailService');
const {
  createResetToken,
  verifyResetToken,
  deleteResetToken
} = require('../services/passwordResetService');
const fetch = require('node-fetch');

// É crucial que esta variável de ambiente esteja definida no seu arquivo .env
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

// --- FUNÇÕES DE AUTENTICAÇÃO ---

/**
 * Registra um novo usuário no Firebase Authentication e no Firestore.
 */
exports.register = async (req, res) => {
  const { email, password, userType, nome, telefone, ...otherData } = req.body;

  if (!email || !password || !userType || !nome) {
    return res.status(400).json({ message: 'Campos essenciais (email, senha, tipo, nome) são obrigatórios.' });
  }

  try {
    // Verifica se o usuário já existe para evitar erros não tratados do Firebase
    try {
      await auth.getUserByEmail(email);
      // Se a linha acima não falhar, o usuário existe.
      return res.status(409).json({ message: 'O e-mail fornecido já está em uso.' });
    } catch (error) {
      // Se o erro for 'auth/user-not-found', isso é o esperado. Prosseguimos.
      if (error.code !== 'auth/user-not-found') {
        throw error; // Lança outros erros inesperados para o catch principal
      }
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

    res.status(201).json({ message: 'Usuário registrado com sucesso!', uid: userRecord.uid });
  } catch (error) {
    console.error("ERRO CRÍTICO NO REGISTRO:", error);
    res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor ao registrar o usuário.', error: error.message });
  }
};

/**
 * Inicia o processo de recuperação de senha.
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'O campo de e-mail é obrigatório.' });

  try {
    // Verifica se o usuário existe antes de enviar o e-mail
    await auth.getUserByEmail(email);

    const token = await createResetToken(email);
    const resetLink = `${process.env.FRONTEND_URL}/resetar-senha?token=${token}`; // Usar variável de ambiente para a URL do frontend
    
    const enviado = await sendEmail(
      email,
      'Recuperação de Senha - BahiaExpress',
      `Olá! Recebemos uma solicitação para redefinir sua senha. Clique no link para continuar: ${resetLink}`,
      `<p>Olá!</p><p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
       <a href="${resetLink}" style="background-color:#007bff;color:#ffffff;padding:12px 20px;border-radius:5px;text-decoration:none;display:inline-block;">Redefinir Senha</a>
       <p>Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>`
    );

    if (!enviado) {
      return res.status(500).json({ message: 'Ocorreu um erro ao tentar enviar o e-mail de recuperação.' });
    }

    return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.' });
  } catch (error) {
    // Se o usuário não for encontrado, NÃO retornamos um erro 404 para evitar que alguém descubra quais e-mails estão cadastrados.
    if (error.code === 'auth/user-not-found') {
      return res.status(200).json({ message: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.' });
    }
    console.error('ERRO NA RECUPERAÇÃO DE SENHA:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

/**
 * Finaliza a redefinição de senha com um token válido.
 */
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'O token e a nova senha são obrigatórios.' });
  }
  if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const email = await verifyResetToken(token);
    if (!email) {
      return res.status(400).json({ message: 'Token inválido, expirado ou já utilizado.' });
    }

    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });
    await deleteResetToken(token); // Invalida o token após o uso

    return res.status(200).json({ message: 'Sua senha foi redefinida com sucesso.' });
  } catch (error) {
    console.error('ERRO AO REDEFINIR SENHA:', error);
    return res.status(500).json({ message: 'Ocorreu um erro ao redefinir a senha.' });
  }
};

/**
 * Autentica um usuário com e-mail e senha.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }
  if (!FIREBASE_API_KEY) {
      console.error("ERRO FATAL: FIREBASE_API_KEY não está definida no .env");
      return res.status(500).json({ message: "Erro de configuração do servidor." });
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
        let message = 'Credenciais inválidas. Por favor, verifique seu e-mail e senha.';
        if(data.error.message === 'EMAIL_NOT_FOUND' || data.error.message === 'INVALID_PASSWORD') {
            // Não damos uma mensagem específica para segurança
        }
        return res.status(401).json({ message });
    }
    
    // Adiciona os dados do Firestore à resposta de login
    const userDoc = await db.collection('users').doc(data.localId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    return res.status(200).json({
      message: "Login bem-sucedido.",
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      uid: data.localId,
      user: userData // Envia os dados do perfil junto
    });
  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    return res.status(500).json({ message: 'Erro ao processar o login.' });
  }
};

/**
 * Ação de logout. O backend não precisa fazer muito, pois o estado é gerenciado no cliente.
 */
exports.logout = (req, res) => {
  // O logout real é o cliente descartando o idToken.
  // Esta rota existe para conformidade e pode ser usada para registrar eventos de logout se necessário.
  res.status(200).json({ message: 'Logout sinalizado com sucesso.' });
};

/**
 * Autentica um usuário usando um idToken do Google.
 */
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: 'O idToken do Google é obrigatório.' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    // Se o usuário não existir no Firestore, o criamos.
    if (!doc.exists) {
        await userRef.set({
            uid,
            email,
            nome: name,
            userType: 'cliente', // Define um tipo padrão
            createdAt: new Date(),
        });
    }
    
    const userDoc = await userRef.get(); // Re-lê para ter os dados mais atuais

    return res.status(200).json({ 
        message: 'Login com Google realizado com sucesso.',
        idToken, // O mesmo token pode ser usado pelo cliente
        user: userDoc.data()
    });
  } catch (error) {
    console.error("ERRO NO LOGIN COM GOOGLE:", error);
    return res.status(401).json({ message: 'Token do Google inválido ou expirado.' });
  }
};