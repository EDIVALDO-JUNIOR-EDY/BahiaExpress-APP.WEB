const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registro de usuário
router.post('/register', authController.register);

// Recuperação de senha
router.post('/forgot-password', authController.forgotPassword);

// Redefinição de senha
router.post('/reset-password', authController.resetPassword);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Validação de token
router.post('/validate-token', authController.validateToken);

// Login com Google OAuth2
router.post('/google-login', authController.googleLogin);

// Buscar perfil (GET para receber uid via params)
router.get('/profile/:uid', authController.getProfile);

// Atualizar perfil
router.put('/profile', authController.updateProfile);

// Excluir usuário
router.delete('/profile', authController.deleteUser);

module.exports = router;