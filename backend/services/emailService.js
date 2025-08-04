// C:/dev/backend/services/emailService.js
// VERSÃO FINAL CORRIGIDA E ROBUSTA - Protocolo DEV.SENIOR

const nodemailer = require('nodemailer');

// A configuração do transporter permanece a mesma.
// A MUDANÇA CRÍTICA está na linha abaixo: 'createTransport' é o nome correto.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true, // true para a porta 465, false para outras
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Função de envio de e-mail com logging explícito de sucesso e falha.
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ [Email Service] E-mail enviado com sucesso para: ${to}. Message ID: ${info.messageId}`);
        return true;

    } catch (error) {
        console.error(`❌ [Email Service] FALHA CRÍTICA ao enviar e-mail para: ${to}`);
        console.error(`❌ Causa do Erro do Nodemailer:`, error);
        return false;
    }
};

module.exports = { sendEmail };