
// CÓDIGO NOVO PARA: backend/routes/notificacaoRoutes.js
const express = require('express');
const { db } = require('../firebaseConfig');
const router = express.Router();

// ROTA NOVA: Busca as notificações NÃO LIDAS de um usuário
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const snapshot = await db.collection('notificacoes')
            .where('paraUsuarioId', '==', userId)
            .where('lida', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) return res.status(200).send([]);
        const notificacoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(notificacoes);

    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        res.status(500).send({ message: 'Erro no servidor', error: error.message });
    }
});

// ROTA NOVA: Marca uma notificação específica como lida
router.post('/marcar-como-lida/:notificacaoId', async (req, res) => {
    try {
        const { notificacaoId } = req.params;
        await db.collection('notificacoes').doc(notificacaoId).update({ lida: true });
        res.status(200).send({ message: 'Notificação marcada como lida.' });
    } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
        res.status(500).send({ message: 'Erro no servidor', error: error.message });
    }
});

module.exports = router;