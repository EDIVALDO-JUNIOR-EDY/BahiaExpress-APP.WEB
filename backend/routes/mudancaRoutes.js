// backend/routes/mudancaRoutes.js

const express = require('express');
const router = express.Router();

// Importa o middleware de proteção e o novo controller
const { protect } = require('../middleware/authMiddleware');
const mudancaController = require('../controllers/mudancaController');

// --- ROTAS DE MUDANÇA ---

// Rota para um cliente criar uma nova solicitação de mudança (precisa estar logado)
router.post('/criar', protect, mudancaController.createMudanca);

// Rota para listar todos os fretes disponíveis (pública)
router.get('/disponiveis', mudancaController.getAvailableMudancas);

// Rota para um motorista aceitar um frete (precisa estar logado)
router.post('/:id/aceitar', protect, mudancaController.acceptMudanca);

// ... Coloque aqui suas outras definições de rotas de mudança, sempre apontando para um controller ...
// Ex: router.put('/:id/status', protect, mudancaController.updateStatus);

module.exports = router;