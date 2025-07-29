// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Padronizando para 'protect'

// Perfil do usuário autenticado
router.get('/me', protect, userController.getOwnProfile);
router.put('/me', protect, userController.updateOwnProfile);
router.delete('/me', protect, userController.deleteOwnAccount);

// Perfil público
router.get('/:uid', userController.getPublicProfile);

module.exports = router;