const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registro de usuário
router.post('/register', authController.register);

// Recuperação de senha (solicita envio do e-mail)
router.post('/forgot-password', authController.forgotPassword);

// Redefinição de senha via token seguro (fluxo aprimorado)
router.post('/reset-password', authController.resetPassword);

// Login do usuário
router.post('/login', authController.login); // Implemente login no controller

// Logout do usuário
router.post('/logout', authController.logout); // Implemente logout no controller

// Validação de token de autenticação JWT/Firebase
router.post('/validate-token', authController.validateToken); // Implemente validação no controller

// Login via Google (OAuth2)
router.post('/google-login', authController.googleLogin); // Implemente integração Google no controller

// Outras rotas futuras podem ser adicionadas abaixo:
// Exemplo: router.post('/verify-email', authController.verifyEmail);

module.exports = router;