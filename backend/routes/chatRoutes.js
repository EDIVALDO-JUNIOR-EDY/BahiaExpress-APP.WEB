// backend/routes/chatRoutes.js

const express = require('express');
const router = express.Router();

// Importa o middleware de proteção e o novo controller
const { protect } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// --- ROTAS DE CHAT ---

// Rota para buscar as mensagens de um chat de uma mudança específica.
// Protegida para garantir que apenas os participantes possam ler.
router.get('/:mudancaId', protect, chatController.getMensagens);

// Rota para enviar uma nova mensagem para o chat de uma mudança.
// O nome da rota foi simplificado de '/:mudancaId/enviar' para '/:mudancaId' com o método POST.
router.post('/:mudancaId', protect, chatController.enviarMensagem);

module.exports = router;