// C:/dev/backend/services/emailService.js
// VERSÃO FINAL COM TEMPLATES RESTAURADOS - Protocolo DEV.SENIOR

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = { from: process.env.EMAIL_FROM, to, subject, text, html };
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [Email Service] E-mail enviado com sucesso para: ${to}. Message ID: ${info.messageId}`);
        return { success: true, info };
    } catch (error) {
        console.error(`❌ [Email Service] FALHA CRÍTICA ao enviar e-mail para: ${to}`);
        console.error(`❌ Causa do Erro do Nodemailer:`, error);
        return { success: false, error };
    }
};

// --- Funções Helper com Templates Completos ---

const sendWelcomeEmail = async (user) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verificar-email?token=${user.emailVerificationToken}`;
    const text = `Olá ${user.nome},\n\nSua conta foi criada com sucesso! Por favor, verifique seu email clicando no link abaixo:\n\n${verificationLink}\n\nAtenciosamente,\nEquipe BahiaExpress`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">BahiaExpress</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-top: 0;">Bem-vindo ao BahiaExpress!</h2>
                <p style="color: #666; line-height: 1.6;">Olá <strong>${user.nome}</strong>,</p>
                <p style="color: #666; line-height: 1.6;">Sua conta foi criada com sucesso! Para garantir a segurança da sua conta, por favor, verifique seu email clicando no botão abaixo:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background: linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verificar Email</a>
                </div>
                <p style="color: #666; line-height: 1.6;">Se você não criou esta conta, por favor, ignore este email.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                    <p>© 2025 BahiaExpress. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>`;
    return sendEmail(user.email, 'Bem-vindo ao BahiaExpress!', text, html);
};

const sendPasswordResetEmail = async (email, resetLink) => {
    const text = `Olá,\n\nRecebemos uma solicitação para redefinir sua senha. Clique no link abaixo para criar uma nova senha:\n\n${resetLink}\n\nEste link expira em 1 hora.\n\nAtenciosamente,\nEquipe BahiaExpress`;
    const html = `
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
        </div>`;
    return sendEmail(email, 'Recuperação de Senha - BahiaExpress', text, html);
};

module.exports = { 
    sendEmail, 
    sendWelcomeEmail, 
    sendPasswordResetEmail 
};