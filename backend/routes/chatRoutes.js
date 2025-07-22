// CÓDIGO NOVO PARA: backend/routes/chatRoutes.js
const express = require('express');
const { db } = require('../firebaseConfig');
const router = express.Router();

// ROTA NOVA: Busca as mensagens de um chat específico (usando o ID da mudança)
// As mensagens serão carregadas em tempo real no frontend, mas esta rota pode ser útil para o histórico inicial.
router.get('/:mudancaId', async (req, res) => {
    try {
        const { mudancaId } = req.params;
        const snapshot = await db.collection('chats').doc(mudancaId).collection('mensagens')
            .orderBy('createdAt', 'asc')
            .get();

        if (snapshot.empty) return res.status(200).send([]);
        const mensagens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(mensagens);

    } catch (error) {
        console.error("Erro ao buscar mensagens do chat:", error);
        res.status(500).send({ message: 'Erro no servidor', error: error.message });
    }
});

// ROTA NOVA: Envia uma nova mensagem para um chat
router.post('/:mudancaId/enviar', async (req, res) => {
    try {
        const { mudancaId } = req.params;
        const { texto, autorId, autorNome } = req.body;

        if (!texto || !autorId || !autorNome) {
            return res.status(400).send({ message: 'Conteúdo da mensagem inválido.' });
        }

        await db.collection('chats').doc(mudancaId).collection('mensagens').add({
            texto,
            autorId,
            autorNome,
            createdAt: new Date()
        });

        res.status(201).send({ message: 'Mensagem enviada.' });

    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        res.status(500).send({ message: 'Erro no servidor', error: error.message });
    }
});

module.exports = router;