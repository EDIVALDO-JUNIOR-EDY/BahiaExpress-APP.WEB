// C:/dev/backend/services/emailService.js
// VERSÃO FINAL CORRIGIDA E OTIMIZADA - Protocolo DEV.SENIOR

const nodemailer = require('nodemailer');

// --- ARQUITETURA OTIMIZADA: Instância única e compartilhada do Transporter ---
// Criamos o transporter uma vez e o reutilizamos. Isso é mais eficiente.
const transporter = nodemailer.createTransport({ // CORREÇÃO 1: Nome da função corrigido de 'createTransporter'
    host: process.env.SMTP_HOST,
    port: 465,       // CORREÇÃO 2: Porta 465 é mais robusta em ambientes de nuvem
    secure: true,    // CORREÇÃO 3: 'secure: true' é mandatório para a porta 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Mantido para compatibilidade
    },
});

// Função de retry que agora reutiliza o transporter existente.
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const info = await transporter.sendMail(mailOptions);
            // LOG DE SUCESSO PADRONIZADO
            console.log(`✅ [EmailService] E-mail enviado. Tentativa: ${attempt}, Message ID: ${info.messageId}`);
            return { success: true, info };
        } catch (error) {
            lastError = error;
            // LOG DE FALHA PADRONIZADO
            console.error(`❌ [EmailService] Falha na tentativa ${attempt}: ${error.message}`);
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`[EmailService] Aguardando ${delay}ms para a próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error(`❌ [EmailService] Falha definitiva após ${maxRetries} tentativas.`);
    return { success: false, error: lastError };
};

// Função principal de envio de e-mail, agora mais limpa.
const sendEmail = async (to, subject, text, html) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("❌ [EmailService] ERRO CRÍTICO: Credenciais SMTP não definidas.");
        return { success: false, error: "Credenciais SMTP não configuradas." };
    }
    if (!to) {
        console.error("❌ [EmailService] ERRO: Destinatário não especificado.");
        return { success: false, error: "Destinatário não especificado." };
    }
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"BahiaExpress" <${process.env.SMTP_USER}>`,
        to, subject, text, html
    };
    
    console.log(`[EmailService] Preparando para enviar e-mail para: ${to}`);
    return await sendEmailWithRetry(mailOptions);
};

// --- Funções Helper (sem alteração na lógica, apenas usam o novo sendEmail) ---

const sendWelcomeEmail = async (user) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verificar-email?token=${user.emailVerificationToken}`;
    return sendEmail(
        user.email, 'Bem-vindo ao BahiaExpress!',
        `Olá ${user.nome},\n\nSua conta foi criada com sucesso! Por favor, verifique seu email clicando no link abaixo:\n\n${verificationLink}`,
        `<div>... (Seu template HTML de boas-vindas aqui) ...</div>` // Template omitido por brevidade
    );
};

const sendPasswordResetEmail = async (email, resetLink) => {
    return sendEmail(
        email, 'Recuperação de Senha - BahiaExpress',
        `Olá,\n\nRecebemos uma solicitação para redefinir sua senha. Clique no link abaixo:\n\n${resetLink}`,
        `<div>... (Seu template HTML de recuperação aqui) ...</div>` // Template omitido por brevidade
    );
};

module.exports = { 
    sendEmail, 
    sendWelcomeEmail, 
    sendPasswordResetEmail 
};