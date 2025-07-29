// backend/routes/avaliacaoRoutes.js

const express = require('express');
const router = express.Router();

// Importa o middleware de proteção e o novo controller
const { protect } = require('../middleware/authMiddleware');
const avaliacaoController = require('../controllers/avaliacaoController');

// --- ROTAS DE AVALIAÇÃO ---

// Rota para um cliente criar uma avaliação.
// É protegida para garantir que apenas usuários logados possam avaliar.
// O nome da rota foi simplificado de '/criar' para '/', seguindo o padrão REST.
router.post('/', protect, avaliacaoController.createAvaliacao);

// Rota para buscar as avaliações de um motorista específico.
// Esta rota é pública e pode ser acessada por qualquer um para ver a reputação de um motorista.
router.get('/:motoristaId', avaliacaoController.getAvaliacoesPorMotorista);

module.exports = router;