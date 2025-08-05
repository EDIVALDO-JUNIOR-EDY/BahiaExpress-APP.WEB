// C:/dev/backend/controllers/authController.js
// VERSÃO 3.7 - CORRIGIDA (SEM DEPENDÊNCIA FALTANTE) - Protocolo DEV.SENIOR
const { auth, db } = require('../firebaseConfig');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
const { createResetToken, verifyResetToken, deleteResetToken } = require('../services/passwordResetService');
const fetch = require('node-fetch');
const crypto = require('crypto');

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

// --- Helpers de Validação ---
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password) => password && password.length >= 6;

/**
 * Registro de novo usuário
 */
exports.register = async (req, res) => {
    const { email, password, userType, nome, telefone, ...otherData } = req.body;
    if (!email || !password || !userType || !nome) return res.status(400).json({ success: false, message: 'Campos essenciais são obrigatórios.' });
    if (!isStrongPassword(password)) return res.status(400).json({ success: false, message: 'A senha deve ter pelo menos 6 caracteres.' });
    if (!isValidEmail(email)) return res.status(400).json({ success: false, message: 'Formato de email inválido.' });
    try {
        const userRecord = await auth.createUser({ email, password, displayName: nome });
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
            emailVerificationExpiry: Date.now() + 86400000, 
            ...otherData 
        };
        await db.collection('users').doc(userRecord.uid).set(userData);
        console.log(`✅ [AuthController:Register] Usuário ${userRecord.uid} criado no Firestore.`);
        await sendWelcomeEmail(userData);
        res.status(201).json({ success: true, message: 'Usuário registrado com sucesso! Verifique seu email.', uid: userRecord.uid });
    } catch (error) {
        console.error("❌ [AuthController:Register] FALHA CRÍTICA:", error);
        if (error.code === 'auth/email-already-exists') return res.status(409).json({ success: false, message: 'O e-mail fornecido já está em uso.' });
        res.status(500).json({ success: false, message: 'Ocorreu um erro inesperado ao registrar.' });
    }
};

/**
 * Login com email e senha
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    if (!FIREBASE_API_KEY) return res.status(500).json({ success: false, message: "Erro de configuração do servidor: API Key ausente." });
    try {
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ email, password, returnSecureToken: true }), 
        });
        const data = await response.json();
        if (data.error) return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        const userDoc = await db.collection('users').doc(data.localId).get();
        if (!userDoc.exists) return res.status(404).json({ success: false, message: 'Usuário não encontrado em nosso banco de dados.' });
        const userData = userDoc.data();
        if (!userData.emailVerified) return res.status(401).json({ success: false, message: 'Por favor, verifique seu email antes de fazer login.', emailNotVerified: true });
        await db.collection('users').doc(data.localId).update({ lastLoginAt: new Date() });
        console.log(`✅ [AuthController:Login] Login bem-sucedido para: ${email}`);
        res.status(200).json({ success: true, message: "Login bem-sucedido.", idToken: data.idToken, user: userData });
    } catch (error) {
        console.error("❌ [AuthController:Login] FALHA CRÍTICA:", error);
        res.status(500).json({ success: false, message: 'Erro ao processar o login.' });
    }
};

/**
 * ESQUECI MINHA SENHA
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'E-mail inválido ou não fornecido.' });
    }
    try {
        await auth.getUserByEmail(email);
        const resetToken = await createResetToken(email);
        const resetLink = `${process.env.FRONTEND_URL}/resetar-senha?token=${resetToken}`;
        await sendPasswordResetEmail(email, resetLink);
        console.log(`✅ [AuthController:ForgotPassword] Token gerado para ${email} (salvo em passwordResetTokens)`);
        res.status(200).json({ 
            success: true, 
            message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' 
        });
    } catch (error) {
        console.error(`❌ [AuthController:ForgotPassword] FALHA para ${email}:`, error.message);
        res.status(200).json({ 
            success: true, 
            message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' 
        });
    }
};

/**
 * REDEFINIÇÃO DE SENHA
 */
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !isStrongPassword(newPassword)) {
        return res.status(400).json({ success: false, message: 'Token ou senha inválidos.' });
    }
    try {
        const email = await verifyResetToken(token);
        if (!email) {
            console.error(`❌ [AuthController:ResetPassword] Token inválido: ${token}`);
            return res.status(400).json({ success: false, message: 'Token inválido ou expirado.' });
        }
        const user = await auth.getUserByEmail(email);
        await auth.updateUser(user.uid, { password: newPassword });
        await deleteResetToken(token);
        console.log(`✅ [AuthController:ResetPassword] Senha redefinida para: ${email}`);
        res.status(200).json({ success: true, message: 'Senha redefinida com sucesso.' });
    } catch (error) {
        console.error("❌ [AuthController:ResetPassword] FALHA:", error);
        res.status(500).json({ success: false, message: 'Erro ao redefinir a senha.' });
    }
};

/**
 * Login com Google
 */
exports.googleLogin = async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ success: false, message: 'Token do Google não fornecido.' });
    }
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
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
        } else {
            await db.collection('users').doc(uid).update({ lastLoginAt: new Date() });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Login com Google bem-sucedido.", 
            idToken,
            user: userDoc.exists ? userDoc.data() : userData 
        });
    } catch (error) {
        console.error("❌ [AuthController:GoogleLogin] FALHA:", error);
        res.status(500).json({ success: false, message: 'Erro ao processar login com Google.' });
    }
};

/**
 * Logout
 */
exports.logout = async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ success: false, message: 'Token não fornecido.' });
    }
    try {
        await auth.revokeRefreshTokens(idToken);
        res.status(200).json({ success: true, message: "Logout realizado com sucesso." });
    } catch (error) {
        console.error("❌ [AuthController:Logout] FALHA:", error);
        res.status(500).json({ success: false, message: 'Erro ao processar logout.' });
    }
};

/**
 * Obter usuário atual
 */
exports.getMe = async (req, res) => {
    try {
        const { uid } = req.user;
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }
        
        const userData = userDoc.data();
        res.status(200).json({ success: true, user: userData });
    } catch (error) {
        console.error("❌ [AuthController:GetMe] FALHA:", error);
        res.status(500).json({ success: false, message: 'Erro ao obter usuário.' });
    }
};