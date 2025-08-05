// C:/dev/backend/routes/authRoutes.js
// VERSÃO 3.8 - COM ROTA DE VERIFICAÇÃO - Protocolo DEV.SENIOR
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// =================================================================
// ROTAS PÚBLICAS (NÃO REQUEM AUTENTICAÇÃO)
// =================================================================

/**
 * Registro de novo usuário
 * POST /api/auth/register
 * Body: { email, password, userType, nome, telefone, ... }
 */
router.post('/register', authController.register);

/**
 * Login com email e senha
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', authController.login);

/**
 * Login com Google OAuth
 * POST /api/auth/google-login
 * Body: { idToken }
 */
router.post('/google-login', authController.googleLogin);

/**
 * Solicitação de recuperação de senha
 * POST /api/auth/forgot-password
 * Body: { email }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * Redefinição de senha com token
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
router.post('/reset-password', authController.resetPassword);

/**
 * Verificação de e-mail com token
 * GET /api/auth/verify-email?token=<token>
 * Query: { token }
 */
router.get('/verify-email', authController.verifyEmail);

// =================================================================
// ROTAS PROTEGIDAS (REQUEM AUTENTICAÇÃO VÁLIDA)
// =================================================================

/**
 * Obter dados do usuário atual
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
router.get('/me', authController.getMe);

/**
 * Logout do usuário
 * POST /api/auth/logout
 * Header: Authorization: Bearer <token>
 * Body: { idToken }
 */
router.post('/logout', authController.logout);

// =================================================================
// EXPORTAÇÃO DAS ROTAS
// =================================================================

module.exports = router;