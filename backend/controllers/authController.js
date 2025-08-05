// C:/dev/backend/controllers/authController.js
// VERSÃO 3.6 - APRIMORADA COM FUNCIONALIDADES COMPLETAS - Protocolo DEV.SENIOR
const { auth, db } = require('../firebaseConfig');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
const { createResetToken, verifyResetToken, deleteResetToken } = require('../services/passwordResetService');
const fetch = require('node-fetch');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

// Rate Limiting para proteção contra ataques
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas por IP
  message: { success: false, message: 'Muitas tentativas de login. Tente novamente mais tarde.' }
});

// --- Helpers de Validação Aprimorados ---
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password) => {
  // Pelo menos 8 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
};

/**
 * Registro de novo usuário - APRIMORADO
 */
exports.register = async (req, res) => {
  console.log(`🔍 [AuthController:Register] Iniciando registro`);
  const { email, password, userType, nome, telefone, ...otherData } = req.body;
  
  // Validação robusta
  if (!email || !password || !userType || !nome) {
    console.log(`❌ [AuthController:Register] Campos faltando`);
    return res.status(400).json({ 
      success: false, 
      message: 'Campos essenciais são obrigatórios.' 
    });
  }
  
  if (!isStrongPassword(password)) {
    console.log(`❌ [AuthController:Register] Senha fraca`);
    return res.status(400).json({ 
      success: false, 
      message: 'A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, número e caractere especial.' 
    });
  }
  
  if (!isValidEmail(email)) {
    console.log(`❌ [AuthController:Register] Email inválido: ${email}`);
    return res.status(400).json({ 
      success: false, 
      message: 'Formato de email inválido.' 
    });
  }

  try {
    console.log(`[AuthController:Register] Criando usuário no Firebase: ${email}`);
    const userRecord = await auth.createUser({ 
      email, 
      password, 
      displayName: nome 
    });
    
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const userData = { 
      uid: userRecord.uid, 
      email, 
      userType, 
      nome, 
      telefone: telefone || null, 
      createdAt: new Date(), 
      updatedAt: new Date(), 
      emailVerified: false, 
      status: 'active', 
      emailVerificationToken, 
      emailVerificationExpiry: Date.now() + 86400000, // 24 horas
      ...otherData 
    };
    
    console.log(`[AuthController:Register] Salvando usuário no Firestore: ${userRecord.uid}`);
    await db.collection('users').doc(userRecord.uid).set(userData);
    
    console.log(`[AuthController:Register] Enviando email de boas-vindas`);
    await sendWelcomeEmail(userData);
    
    console.log(`✅ [AuthController:Register] Usuário criado com sucesso: ${userRecord.uid}`);
    res.status(201).json({ 
      success: true, 
      message: 'Usuário registrado com sucesso! Verifique seu email.', 
      uid: userRecord.uid 
    });
  } catch (error) {
    console.error("❌ [AuthController:Register] FALHA:", error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ 
        success: false, 
        message: 'O e-mail fornecido já está em uso.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Ocorreu um erro inesperado ao registrar.' 
    });
  }
};

/**
 * Login com email e senha - APRIMORADO COM LOGS DETALHADOS
 */
exports.login = [loginLimiter, async (req, res) => {
  console.log(`🔍 [AuthController:Login] Tentativa de login para: ${req.body.email}`);
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log(`❌ [AuthController:Login] Campos faltando`);
    return res.status(400).json({ 
      success: false, 
      message: 'E-mail e senha são obrigatórios.' 
    });
  }
  
  if (!FIREBASE_API_KEY) {
    console.log(`❌ [AuthController:Login] FIREBASE_API_KEY ausente`);
    return res.status(500).json({ 
      success: false, 
      message: "Erro de configuração do servidor: API Key ausente." 
    });
  }

  try {
    console.log(`[AuthController:Login] Verificando usuário no Firebase: ${email}`);
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ [AuthController:Login] Usuário encontrado: ${userRecord.uid}`);
    
    console.log(`[AuthController:Login] Enviando requisição para Firebase Auth`);
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, 
      { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ 
          email, 
          password, 
          returnSecureToken: true 
        }), 
      }
    );
    
    const data = await response.json();
    console.log(`[AuthController:Login] Resposta do Firebase:`, data);
    
    if (data.error) {
      console.log(`❌ [AuthController:Login] Erro do Firebase: ${data.error.message}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas.' 
      });
    }
    
    console.log(`[AuthController:Login] Buscando usuário no Firestore: ${data.localId}`);
    const userDoc = await db.collection('users').doc(data.localId).get();
    
    if (!userDoc.exists) {
      console.log(`❌ [AuthController:Login] Usuário não encontrado no Firestore`);
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado em nosso banco de dados.' 
      });
    }
    
    const userData = userDoc.data();
    
    if (!userData.emailVerified) {
      console.log(`❌ [AuthController:Login] Email não verificado: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Por favor, verifique seu email antes de fazer login.', 
        emailNotVerified: true 
      });
    }
    
    await db.collection('users').doc(data.localId).update({ 
      lastLoginAt: new Date() 
    });
    
    console.log(`✅ [AuthController:Login] Login bem-sucedido: ${email}`);
    res.status(200).json({ 
      success: true, 
      message: "Login bem-sucedido.", 
      idToken: data.idToken, 
      user: userData 
    });
  } catch (error) {
    console.error("❌ [AuthController:Login] FALHA:", error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar o login.' 
    });
  }
}];

/**
 * ESQUECI MINHA SENHA - APRIMORADO
 */
exports.forgotPassword = async (req, res) => {
  console.log(`🔍 [AuthController:ForgotPassword] Solicitação para: ${req.body.email}`);
  const { email } = req.body;
  
  if (!email || !isValidEmail(email)) {
    console.log(`❌ [AuthController:ForgotPassword] Email inválido: ${email}`);
    return res.status(400).json({ 
      success: false, 
      message: 'E-mail inválido ou não fornecido.' 
    });
  }

  try {
    console.log(`[AuthController:ForgotPassword] Verificando usuário: ${email}`);
    await auth.getUserByEmail(email);
    
    console.log(`[AuthController:ForgotPassword] Criando token de reset`);
    const resetToken = await createResetToken(email);
    const resetLink = `${process.env.FRONTEND_URL}/resetar-senha?token=${resetToken}`;
    
    console.log(`[AuthController:ForgotPassword] Enviando email de recuperação`);
    await sendPasswordResetEmail(email, resetLink);
    
    console.log(`✅ [AuthController:ForgotPassword] Processo concluído para: ${email}`);
    res.status(200).json({ 
      success: true, 
      message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' 
    });
  } catch (error) {
    console.error(`❌ [AuthController:ForgotPassword] FALHA para ${email}:`, error.message);
    
    // Mensagem genérica por segurança
    res.status(200).json({ 
      success: true, 
      message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' 
    });
  }
};

/**
 * REDEFINIÇÃO DE SENHA - APRIMORADO
 */
exports.resetPassword = async (req, res) => {
  console.log(`🔍 [AuthController:ResetPassword] Solicitação de reset`);
  const { token, newPassword } = req.body;
  
  if (!token || !isStrongPassword(newPassword)) {
    console.log(`❌ [AuthController:ResetPassword] Dados inválidos`);
    return res.status(400).json({ 
      success: false, 
      message: 'Token ou senha inválidos. A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, número e caractere especial.' 
    });
  }

  try {
    console.log(`[AuthController:ResetPassword] Verificando token`);
    const email = await verifyResetToken(token);
    
    if (!email) {
      console.log(`❌ [AuthController:ResetPassword] Token inválido ou expirado`);
      return res.status(400).json({ 
        success: false, 
        message: 'Token inválido ou expirado.' 
      });
    }
    
    console.log(`[AuthController:ResetPassword] Atualizando senha para: ${email}`);
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });
    
    console.log(`[AuthController:ResetPassword] Removendo token usado`);
    await deleteResetToken(token);
    
    console.log(`✅ [AuthController:ResetPassword] Senha redefinida com sucesso: ${email}`);
    res.status(200).json({ 
      success: true, 
      message: 'Senha redefinida com sucesso.' 
    });
  } catch (error) {
    console.error("❌ [AuthController:ResetPassword] FALHA:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao redefinir a senha.' 
    });
  }
};

/**
 * Login com Google - IMPLEMENTADO
 */
exports.googleLogin = async (req, res) => {
  console.log(`🔍 [AuthController:GoogleLogin] Tentativa de login com Google`);
  const { idToken } = req.body;
  
  if (!idToken) {
    console.log(`❌ [AuthController:GoogleLogin] Token não fornecido`);
    return res.status(400).json({ 
      success: false, 
      message: 'Token do Google não fornecido.' 
    });
  }

  try {
    console.log(`[AuthController:GoogleLogin] Verificando token`);
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    
    console.log(`[AuthController:GoogleLogin] Token válido para: ${email}`);
    
    // Verificar se o usuário existe no Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.log(`[AuthController:GoogleLogin] Criando novo usuário: ${email}`);
      // Criar novo usuário
      const userData = {
        uid,
        email,
        nome: name,
        foto: picture,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        authProvider: 'google'
      };
      
      await db.collection('users').doc(uid).set(userData);
      console.log(`✅ [AuthController:GoogleLogin] Usuário criado: ${uid}`);
    } else {
      console.log(`[AuthController:GoogleLogin] Usuário existente: ${email}`);
      // Atualizar último login
      await db.collection('users').doc(uid).update({ 
        lastLoginAt: new Date() 
      });
    }
    
    console.log(`✅ [AuthController:GoogleLogin] Login bem-sucedido: ${email}`);
    res.status(200).json({ 
      success: true, 
      message: "Login com Google bem-sucedido.", 
      idToken,
      user: userDoc.exists ? userDoc.data() : userData 
    });
  } catch (error) {
    console.error("❌ [AuthController:GoogleLogin] FALHA:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar login com Google.' 
    });
  }
};

/**
 * Logout - IMPLEMENTADO
 */
exports.logout = async (req, res) => {
  console.log(`🔍 [AuthController:Logout] Solicitação de logout`);
  const { idToken } = req.body;
  
  if (!idToken) {
    console.log(`❌ [AuthController:Logout] Token não fornecido`);
    return res.status(400).json({ 
      success: false, 
      message: 'Token não fornecido.' 
    });
  }

  try {
    console.log(`[AuthController:Logout] Revogando token`);
    await auth.revokeRefreshTokens(idToken);
    
    console.log(`✅ [AuthController:Logout] Logout bem-sucedido`);
    res.status(200).json({ 
      success: true, 
      message: "Logout realizado com sucesso." 
    });
  } catch (error) {
    console.error("❌ [AuthController:Logout] FALHA:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar logout.' 
    });
  }
};

/**
 * Obter usuário atual - NOVA FUNCIONALIDADE
 */
exports.getMe = async (req, res) => {
  console.log(`🔍 [AuthController:GetMe] Buscando usuário atual`);
  
  try {
    // O usuário já está disponível no middleware
    const { uid } = req.user;
    
    console.log(`[AuthController:GetMe] Buscando dados do usuário: ${uid}`);
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      console.log(`❌ [AuthController:GetMe] Usuário não encontrado: ${uid}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado.' 
      });
    }
    
    const userData = userDoc.data();
    console.log(`✅ [AuthController:GetMe] Usuário encontrado: ${userData.email}`);
    
    res.status(200).json({ 
      success: true, 
      user: userData 
    });
  } catch (error) {
    console.error("❌ [AuthController:GetMe] FALHA:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter usuário.' 
    });
  }
};