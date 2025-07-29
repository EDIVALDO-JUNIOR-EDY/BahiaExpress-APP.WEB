// backend/routes/contratoRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const contratoController = require('../controllers/contratoController');

router.get('/gerar/:mudancaId', protect, contratoController.gerarContratoPDF);

module.exports = router;