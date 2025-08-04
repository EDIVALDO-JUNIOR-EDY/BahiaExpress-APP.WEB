// C:/dev/backend/controllers/authController.js
const { auth, db } = require('../firebaseConfig');
const { sendEmail } = require('../services/emailService');
const { createResetToken, verifyResetToken, deleteResetToken } = require('../services/passwordResetService');
const fetch = require('node-fetch');
const crypto = require('crypto');
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

/**
 * Registro de novo usuário com validação completa
 */
exports.register = async (req, res) => {
    const { email, password, userType, nome, telefone, ...otherData } = req.body;
    
    // Validação completa dos campos obrigatórios
    if (!email || !password || !userType || !nome) {
        return res.status(400).json({ 
            success: false,
            message: 'Campos essenciais são obrigatórios: email, password, userType, nome.' 
        });
    }
    
    // Validação da força da senha
    if (password.length < 6) {
        return res.status(400).json({ 
            success: false,
            message: 'A senha deve ter pelo menos 6 caracteres.' 
        });
    }
    
    // Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false,
            message: 'Formato de email inválido.' 
        });
    }
    
    try {
        // Criar usuário no Firebase Authentication
        const userRecord = await auth.createUser({ 
            email, 
            password, 
            displayName: nome 
        });
        
        // Preparar dados do usuário para o Firestore
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
            ...otherData
        };
        
        // Salvar usuário no Firestore
        await db.collection('users').doc(userRecord.uid).set(userData);
        
        // Gerar token de verificação de email
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        await db.collection('users').doc(userRecord.uid).update({
            emailVerificationToken,
            emailVerificationExpiry: Date.now() + 86400000 // 24 horas
        });
        
        // Enviar email de boas-vindas com template personalizado
        const verificationLink = `${process.env.FRONTEND_URL}/verificar-email?token=${emailVerificationToken}`;
        const emailSent = await sendEmail(
            email,
            'Bem-vindo ao BahiaExpress!',
            `Olá ${nome},\n\nSua conta foi criada com sucesso! Por favor, verifique seu email clicando no link abaixo:\n\n${verificationLink}\n\nAtenciosamente,\nEquipe BahiaExpress`,
            `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">BahiaExpress</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Bem-vindo ao BahiaExpress!</h2>
                        <p style="color: #666; line-height: 1.6;">Olá <strong>${nome}</strong>,</p>
                        <p style="color: #666; line-height: 1.6;">Sua conta foi criada com sucesso! Para garantir a segurança da sua conta, por favor, verifique seu email clicando no botão abaixo:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" style="background: linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verificar Email</a>
                        </div>
                        <p style="color: #666; line-height: 1.6;">Se você não criou esta conta, por favor, ignore este email.</p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                            <p>© 2025 BahiaExpress. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </div>
            `
        );
        
        res.status(201).json({ 
            success: true, 
            message: 'Usuário registrado com sucesso! Verifique seu email.',
            uid: userRecord.uid,
            emailSent: emailSent
        });
        
    } catch (error) {
        console.error("ERRO CRÍTICO NO REGISTRO:", error);
        
        // Tratamento específico para erros comuns
        if (error.code === 'auth/email-already-exists') {
            return res.status(409).json({ 
                success: false, 
                message: 'O e-mail fornecido já está em uso.' 
            });
        }
        
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ 
                success: false, 
                message: 'Formato de email inválido.' 
            });
        }
        
        if (error.code === 'auth/weak-password') {
            return res.status(400).json({ 
                success: false, 
                message: 'A senha é muito fraca. Use pelo menos 6 caracteres.' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Ocorreu um erro inesperado ao registrar.' 
        });
    }
};

/**
 * Login com email e senha
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    // Validação dos campos
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'E-mail e senha são obrigatórios.' 
        });
    }
    
    if (!FIREBASE_API_KEY) {
        return res.status(500).json({ 
            success: false, 
            message: "Erro de configuração do servidor: API Key ausente." 
        });
    }
    
    try {
        // Autenticar com Firebase Authentication
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email, 
                password, 
                returnSecureToken: true 
            }),
        });
        
        const data = await response.json();
        
        if (data.error) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciais inválidas.' 
            });
        }
        
        // Buscar dados completos do usuário no Firestore
        const userDoc = await db.collection('users').doc(data.localId).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        // Verificar se o email foi verificado
        if (!userData.emailVerified) {
            return res.status(401).json({ 
                success: false, 
                message: 'Por favor, verifique seu email antes de fazer login.',
                emailNotVerified: true
            });
        }
        
        // Atualizar último login
        await db.collection('users').doc(data.localId).update({
            lastLoginAt: new Date()
        });
        
        res.status(200).json({
            success: true,
            message: "Login bem-sucedido.",
            idToken: data.idToken,
            user: userData
        });
        
    } catch (error) {
        console.error("ERRO NO LOGIN:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao processar o login.' 
        });
    }
};

/**
 * Esqueci minha senha
 */
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ 
            success: false, 
            message: 'E-mail é obrigatório.' 
        });
    }
    
    // Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Formato de email inválido.' 
        });
    }
    
    try {
        // Verificar se o usuário existe
        const userRecord = await auth.getUserByEmail(email);
        
        // Gerar token seguro
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hora
        
        // Salvar token no Firestore
        await db.collection('users').doc(userRecord.uid).update({
            resetPasswordToken: resetToken,
            resetPasswordExpiry: resetTokenExpiry
        });
        
        // Criar link de reset
        const resetLink = `${process.env.FRONTEND_URL}/resetar-senha?token=${resetToken}`;
        
        // Enviar email com template personalizado
        const emailSent = await sendEmail(
            email,
            'Recuperação de Senha - BahiaExpress',
            `Olá,\n\nRecebemos uma solicitação para redefinir sua senha. Clique no link abaixo para criar uma nova senha:\n\n${resetLink}\n\nEste link expira em 1 hora por motivos de segurança.\n\nSe você não solicitou esta recuperação, ignore este email.\n\nAtenciosamente,\nEquipe BahiaExpress`,
            `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">BahiaExpress</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Recuperação de Senha</h2>
                        <p style="color: #666; line-height: 1.6;">Olá,</p>
                        <p style="color: #666; line-height: 1.6;">Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" style="background: linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Redefinir Senha</a>
                        </div>
                        <p style="color: #666; line-height: 1.6;">Se você não solicitou esta recuperação, ignore este email.</p>
                        <p style="color: #666; line-height: 1.6;">Este link expira em 1 hora por motivos de segurança.</p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                            <p>© 2025 BahiaExpress. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </div>
            `
        );
        
        res.status(200).json({ 
            success: true, 
            message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.',
            emailSent: emailSent
        });
        
    } catch (error) {
        console.error('ERRO NA RECUPERAÇÃO DE SENHA:', error);
        
        // Por segurança, não informamos se o email existe ou não
        res.status(200).json({ 
            success: true, 
            message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' 
        });
    }
};

/**
 * Redefinição de senha
 */
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    
    // Validação dos campos
    if (!token || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Token e nova senha são obrigatórios.' 
        });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'A senha deve ter pelo menos 6 caracteres.' 
        });
    }
    
    try {
        // Verificar token
        const email = await verifyResetToken(token);
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Token inválido ou expirado.' 
            });
        }
        
        // Buscar usuário
        const user = await auth.getUserByEmail(email);
        
        // Atualizar senha
        await auth.updateUser(user.uid, { password: newPassword });
        
        // Limpar token
        await deleteResetToken(token);
        
        // Enviar confirmação
        await sendEmail(
            email,
            'Senha Redefinida com Sucesso - BahiaExpress',
            `Olá,\n\nSua senha foi redefinida com sucesso!\n\nSe você não solicitou esta alteração, entre em contato conosco imediatamente.\n\nAtenciosamente,\nEquipe BahiaExpress`,
            `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">BahiaExpress</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Senha Redefinida com Sucesso!</h2>
                        <p style="color: #666; line-height: 1.6;">Olá,</p>
                        <p style="color: #666; line-height: 1.6;">Sua senha foi redefinida com sucesso! Se você não solicitou esta alteração, entre em contato conosco imediatamente.</p>
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                            <p>© 2025 BahiaExpress. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </div>
            `
        );
        
        res.status(200).json({ 
            success: true, 
            message: 'Senha redefinida com sucesso.' 
        });
        
    } catch (error) {
        console.error('ERRO AO REDEFINIR SENHA:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao redefinir a senha.' 
        });
    }
};

/**
 * Login com Google
 */
exports.googleLogin = async (req, res) => {
    const { idToken } = req.body;
    
    if (!idToken) {
        return res.status(400).json({ 
            success: false, 
            message: 'idToken do Google é obrigatório.' 
        });
    }
    
    try {
        // Verificar token do Google
        const decodedToken = await auth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decodedToken;
        
        // Buscar usuário no Firestore
        const userRef = db.collection('users').doc(uid);
        let userDoc = await userRef.get();
        
        let userData;
        
        if (!userDoc.exists) {
            // Criar novo usuário
            userData = {
                uid,
                email,
                nome: name,
                picture,
                userType: 'cliente',
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'active',
                provider: 'google'
            };
            
            await userRef.set(userData);
            
            // Enviar email de boas-vindas
            await sendEmail(
                email,
                'Bem-vindo ao BahiaExpress!',
                `Olá ${name},\n\nSua conta foi criada com sucesso usando o Google! Estamos felizes em ter você conosco.\n\nAtenciosamente,\nEquipe BahiaExpress`,
                `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">BahiaExpress</h1>
                        </div>
                        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; margin-top: 0;">Bem-vindo ao BahiaExpress!</h2>
                            <p style="color: #666; line-height: 1.6;">Olá <strong>${name}</strong>,</p>
                            <p style="color: #666; line-height: 1.6;">Sua conta foi criada com sucesso usando o Google! Estamos felizes em ter você conosco.</p>
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                                <p>© 2025 BahiaExpress. Todos os direitos reservados.</p>
                            </div>
                        </div>
                    </div>
                `
            );
            
        } else {
            // Atualizar usuário existente
            userData = userDoc.data();
            userData.updatedAt = new Date();
            userData.picture = picture;
            userData.lastLoginAt = new Date();
            
            await userRef.update({
                picture,
                updatedAt: new Date(),
                lastLoginAt: new Date()
            });
        }
        
        // Gerar token personalizado para o backend
        const customToken = await auth.createCustomToken(uid);
        
        res.status(200).json({ 
            success: true,
            message: 'Login com Google bem-sucedido.',
            idToken: customToken,
            user: userData
        });
        
    } catch (error) {
        console.error("ERRO NO LOGIN COM GOOGLE:", error);
        res.status(401).json({ 
            success: false, 
            message: 'Token do Google inválido.' 
        });
    }
};

/**
 * Logout
 */
exports.logout = async (req, res) => {
    try {
        // Aqui você pode adicionar lógica adicional para invalidar tokens
        res.status(200).json({ 
            success: true,
            message: 'Logout sinalizado com sucesso.' 
        });
    } catch (error) {
        console.error("ERRO NO LOGOUT:", error);
        res.status(500).json({ 
            success: false,
            message: 'Erro ao processar logout.' 
        });
    }
};