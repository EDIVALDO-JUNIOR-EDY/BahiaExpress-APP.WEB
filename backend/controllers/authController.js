// C:/dev/backend/controllers/authController.js

const { auth, db } = require('../firebaseConfig');
const { sendEmail } = require('../services/emailService');
const { createResetToken, verifyResetToken, deleteResetToken } = require('../services/passwordResetService');
const fetch = require('node-fetch');

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

exports.register = async (req, res) => {
    const { email, password, userType, nome, telefone, ...otherData } = req.body;
    if (!email || !password || !userType || !nome) {
        return res.status(400).json({ message: 'Campos essenciais são obrigatórios.' });
    }
    try {
        const userRecord = await auth.createUser({ email, password, displayName: nome });
        await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid, email, userType, nome,
            telefone: telefone || null, createdAt: new Date(), ...otherData
        });

        // --- IMPLEMENTAÇÃO: Envio de e-mail de boas-vindas ---
        await sendEmail(
            email,
            'Bem-vindo(a) ao BahiaExpress!',
            `Olá ${nome},\n\nSua conta foi criada com sucesso. Estamos felizes em ter você conosco.\n\nAtenciosamente,\nEquipe BahiaExpress`,
            `<h3>Olá ${nome},</h3><p>Sua conta no BahiaExpress foi criada com sucesso!</p><p>Atenciosamente,<br>Equipe BahiaExpress</p>`
        );

        res.status(201).json({ message: 'Usuário registrado com sucesso!', uid: userRecord.uid });
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({ message: 'O e-mail fornecido já está em uso.' });
        }
        console.error("ERRO CRÍTICO NO REGISTRO:", error);
        res.status(500).json({ message: 'Ocorreu um erro inesperado ao registrar.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    if (!FIREBASE_API_KEY) return res.status(500).json({ message: "Erro de configuração do servidor: API Key ausente." });

    try {
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        });
        const data = await response.json();
        if (data.error) return res.status(401).json({ message: 'Credenciais inválidas.' });
        
        const userDoc = await db.collection('users').doc(data.localId).get();
        return res.status(200).json({
            message: "Login bem-sucedido.", idToken: data.idToken,
            user: userDoc.exists() ? userDoc.data() : {}
        });
    } catch (error) {
        console.error("ERRO NO LOGIN:", error);
        return res.status(500).json({ message: 'Erro ao processar o login.' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'E-mail é obrigatório.' });
    try {
        await auth.getUserByEmail(email); // Apenas verifica se existe
        const token = await createResetToken(email);
        const resetLink = `${process.env.FRONTEND_URL}/resetar-senha?token=${token}`;
        await sendEmail(email, 'Recuperação de Senha - BahiaExpress', `Link para reset: ${resetLink}`, `<p>Clique aqui para resetar: <a href="${resetLink}">Redefinir Senha</a></p>`);
        return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' });
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' });
        }
        console.error('ERRO NA RECUPERAÇÃO DE SENHA:', error);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Token e uma nova senha com pelo menos 6 caracteres são obrigatórios.' });
    }
    try {
        const email = await verifyResetToken(token);
        if (!email) return res.status(400).json({ message: 'Token inválido ou expirado.' });
        const user = await auth.getUserByEmail(email);
        await auth.updateUser(user.uid, { password: newPassword });
        await deleteResetToken(token);
        return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
        console.error('ERRO AO REDEFINIR SENHA:', error);
        return res.status(500).json({ message: 'Erro ao redefinir a senha.' });
    }
};

exports.googleLogin = async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken do Google é obrigatório.' });
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const { uid, email, name } = decodedToken;
        const userRef = db.collection('users').doc(uid);
        let doc = await userRef.get();
        if (!doc.exists) {
            await userRef.set({ uid, email, nome: name, userType: 'cliente', createdAt: new Date() });
            doc = await userRef.get();
        }
        return res.status(200).json({ message: 'Login com Google bem-sucedido.', idToken, user: doc.data() });
    } catch (error) {
        console.error("ERRO NO LOGIN COM GOOGLE:", error);
        return res.status(401).json({ message: 'Token do Google inválido.' });
    }
};

exports.logout = (req, res) => {
    res.status(200).json({ message: 'Logout sinalizado.' });
};