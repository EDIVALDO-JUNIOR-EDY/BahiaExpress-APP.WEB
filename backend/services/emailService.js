// C:/dev/backend/services/emailService.js
const nodemailer = require('nodemailer');

// Configuração do transporter com opções avançadas
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true para porta 465, false para outras
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false, // Necessário para alguns serviços de email
            minVersion: 'TLSv1.2'
        },
        connectionTimeout: 10000, // 10 segundos
        greetingTimeout: 10000, // 10 segundos
        socketTimeout: 10000, // 10 segundos
    });
};

// Função de retry para envio de email
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const transporter = createTransporter();
            const info = await transporter.sendMail(mailOptions);
            console.log(`[EmailService] Email enviado com sucesso! Tentativa: ${attempt}, Message ID: ${info.messageId}`);
            return { success: true, info };
        } catch (error) {
            lastError = error;
            console.error(`[EmailService] Falha na tentativa ${attempt}:`, error.message);
            
            // Esperar antes de tentar novamente (exponencial backoff)
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`[EmailService] Aguardando ${delay}ms antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    console.error(`[EmailService] Falha após ${maxRetries} tentativas:`, lastError);
    return { success: false, error: lastError };
};

// Função principal de envio de email
const sendEmail = async (to, subject, text, html) => {
    // Verificar credenciais
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("[EmailService] ERRO CRÍTICO: As credenciais SMTP não estão definidas no .env.");
        return { success: false, error: "Credenciais SMTP não configuradas" };
    }
    
    // Verificar destinatário
    if (!to) {
        console.error("[EmailService] ERRO: Destinatário não especificado.");
        return { success: false, error: "Destinatário não especificado" };
    }
    
    console.log(`[EmailService] Preparando para enviar e-mail para: ${to}`);
    
    // Configurar opções do email
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"BahiaExpress" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: html,
        headers: {
            'X-Priority': '1',
            'X-Mailer': 'BahiaExpress Email Service',
            'X-Mailgun-Track': 'yes',
            'X-Mailgun-Track-Clicks': 'yes',
            'X-Mailgun-Track-Opens': 'yes'
        }
    };
    
    // Enviar email com retry
    const result = await sendEmailWithRetry(mailOptions);
    
    if (result.success) {
        console.log(`[EmailService] ✅ Email enviado com sucesso para ${to}`);
        console.log(`[EmailService] 📧 Assunto: ${subject}`);
        console.log(`[EmailService] 📊 Message ID: ${result.info.messageId}`);
    } else {
        console.error(`[EmailService] ❌ Falha ao enviar email para ${to}:`, result.error.message);
    }
    
    return result;
};

// Função para enviar email de boas-vindas
const sendWelcomeEmail = async (user) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verificar-email?token=${user.emailVerificationToken}`;
    
    return sendEmail(
        user.email,
        'Bem-vindo ao BahiaExpress!',
        `Olá ${user.nome},\n\nSua conta foi criada com sucesso! Por favor, verifique seu email clicando no link abaixo:\n\n${verificationLink}\n\nAtenciosamente,\nEquipe BahiaExpress`,
        `
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
            </div>
        `
    );
};

// Função para enviar email de recuperação de senha
const sendPasswordResetEmail = async (email, resetLink) => {
    return sendEmail(
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
};

module.exports = { 
    sendEmail, 
    sendWelcomeEmail, 
    sendPasswordResetEmail 
};