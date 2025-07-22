// CÓDIGO NOVO PARA: backend/routes/avaliacaoRoutes.js

const express = require('express');
const { db } = require('../firebaseConfig');
const router = express.Router();

// ROTA NOVA: Para o cliente criar uma nova avaliação
router.post('/criar', async (req, res) => {
    try {
        const { mudancaId, motoristaId, clienteId, estrelas, comentario } = req.body;

        // Validação dos dados recebidos
        if (!mudancaId || !motoristaId || !clienteId || !estrelas) {
            return res.status(400).send({ message: 'Dados insuficientes para criar a avaliação.' });
        }

        // Cria o novo documento de avaliação
        await db.collection('avaliacoes').add({
            mudancaId,
            motoristaId,
            clienteId,
            estrelas: Number(estrelas), // Garante que seja um número
            comentario,
            createdAt: new Date()
        });

        // Marca a mudança como "avaliada" para que não possa ser avaliada novamente
        await db.collection('mudancas').doc(mudancaId).update({
            avaliada: true
        });

        res.status(201).send({ message: 'Avaliação enviada com sucesso!' });

    } catch (error) {
        console.error("Erro ao criar avaliação:", error);
        res.status(500).send({ message: 'Erro no servidor ao salvar avaliação.', error: error.message });
    }
});

module.exports = router;