// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// --- ROTAS DE AUTENTICAÇÃO ---

router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/google-login', authController.googleLogin);

module.exports = router;