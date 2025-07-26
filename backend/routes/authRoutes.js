const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de registro de usuário (mantida e aprimorada)
router.post('/register', authController.register);

// Rota de recuperação de senha (nova funcionalidade)
router.post('/forgot-password', authController.forgotPassword);

// Outras rotas futuras podem ser adicionadas aqui:
// Exemplo: router.post('/login', authController.login);

module.exports = router;
