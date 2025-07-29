// backend/controllers/chatController.js

const { db } = require('../firebaseConfig');

/**
 * Busca todas as mensagens de um chat de uma mudança específica.
 * A rota é protegida para garantir que apenas os participantes da mudança (cliente ou motorista)
 * possam ler as mensagens.
 * GET /api/chat/:mudancaId
 */
exports.getMensagens = async (req, res) => {
    const { mudancaId } = req.params;
    const requisitanteId = req.user.uid; // ID do usuário que está pedindo as mensagens

    try {
        const mudancaDoc = await db.collection('mudancas').doc(mudancaId).get();
        if (!mudancaDoc.exists) {
            return res.status(404).json({ message: 'A mudança associada a este chat não foi encontrada.' });
        }

        const mudancaData = mudancaDoc.data();
        // --- Verificação de Segurança ---
        // Garante que o usuário logado é o cliente OU o motorista da mudança.
        if (requisitanteId !== mudancaData.clienteId && requisitanteId !== mudancaData.motoristaId) {
            return res.status(403).json({ message: 'Acesso negado. Você não faz parte deste chat.' });
        }

        const snapshot = await db.collection('chats').doc(mudancaId).collection('mensagens')
            .orderBy('createdAt', 'asc')
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const mensagens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(mensagens);

    } catch (error) {
        console.error("Erro ao buscar mensagens do chat:", error);
        res.status(500).json({ message: 'Erro no servidor ao buscar mensagens.' });
    }
};

/**
 * Envia uma nova mensagem para o chat de uma mudança específica.
 * A rota é protegida, e a identidade do autor é pega do token.
 * POST /api/chat/:mudancaId
 */
exports.enviarMensagem = async (req, res) => {
    const { mudancaId } = req.params;
    const { texto } = req.body;
    
    // --- Dados do autor são obtidos de forma segura do token ---
    const autorId = req.user.uid;
    const autorNome = req.user.name || 'Usuário Anônimo';

    if (!texto || texto.trim() === '') {
        return res.status(400).json({ message: 'O texto da mensagem não pode ser vazio.' });
    }

    try {
        const mudancaDoc = await db.collection('mudancas').doc(mudancaId).get();
        if (!mudancaDoc.exists) {
            return res.status(404).json({ message: 'A mudança associada a este chat não foi encontrada.' });
        }

        const mudancaData = mudancaDoc.data();
        // --- Verificação de Segurança ---
        // Garante que o usuário logado é o cliente OU o motorista da mudança antes de permitir o envio.
        if (autorId !== mudancaData.clienteId && autorId !== mudancaData.motoristaId) {
            return res.status(403).json({ message: 'Acesso negado. Você não pode enviar mensagens neste chat.' });
        }

        const novaMensagem = {
            texto,
            autorId,
            autorNome,
            createdAt: new Date()
        };

        await db.collection('chats').doc(mudancaId).collection('mensagens').add(novaMensagem);

        res.status(201).json({ message: 'Mensagem enviada com sucesso.' });

    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        res.status(500).json({ message: 'Erro no servidor ao enviar mensagem.' });
    }
};