// CÓDIGO COMPLETO E ATUALIZADO para backend/routes/mudancaRoutes.js

const express = require('express');
const { db } = require('../firebaseConfig');
const { verifyAuthToken } = require('../middleware/authMiddleware'); // Importante para segurança
const router = express.Router();

// --- CRIAÇÃO DE MUDANÇA ---
// Rota segura para criar uma nova solicitação de mudança
router.post('/criar', verifyAuthToken, async (req, res) => {
  try {
    // Extrai os dados do corpo da requisição
    const { 
        origem, 
        destino, 
        itens, 
        solicitaEmpacotamento, 
        transportePet, // NOVO
        transporteVeiculo // NOVO
    } = req.body;
    
    // Pega dados do usuário logado a partir do token (mais seguro)
    const clienteId = req.user.uid;
    const clienteNome = req.user.name || 'Nome não informado'; // Pega o nome do token

    const novaMudanca = {
      clienteId,
      clienteNome,
      origem,
      destino,
      itens: itens || [], // Garante que 'itens' seja sempre um array
      solicitaEmpacotamento: !!solicitaEmpacotamento,
      transportePet: !!transportePet,       // NOVO: Garante que seja um booleano
      transporteVeiculo: !!transporteVeiculo, // NOVO: Garante que seja um booleano
      status: 'disponivel', // Status inicial para aparecer na busca de fretes
      createdAt: new Date(),
      motoristaId: null, // Nenhum motorista atribuído ainda
      motoristaNome: null,
    };

    const docRef = await db.collection('mudancas').add(novaMudanca);
    res.status(201).send({ message: 'Solicitação de mudança criada com sucesso!', id: docRef.id });
  } catch (error) {
    console.error("Erro no servidor ao criar mudança:", error);
    res.status(500).send({ message: 'Erro no servidor ao criar mudança', error: error.message });
  }
});

// --- BUSCA E ACEITE DE FRETE ---
// Rota pública para listar fretes disponíveis
router.get('/disponiveis', async (req, res) => {
    // ... (Esta rota não precisa de mudanças, seu código original está ótimo) ...
    // ... mantendo o código original ...
    try {
        const snapshot = await db.collection('mudancas').where('status', '==', 'disponivel').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) return res.status(200).json([]);
        const mudancas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(mudancas);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao buscar mudanças', error: error.message });
    }
});

// Rota segura para um motorista aceitar um frete
router.post('/:id/aceitar', verifyAuthToken, async (req, res) => {
    // ... (Esta rota também está boa, apenas vamos refatorar para pegar o motorista do token) ...
    // ... refatorando para maior segurança ...
    const { id } = req.params;
    const motoristaId = req.user.uid;
    const motoristaNome = req.user.name || 'Nome não informado';

    try {
        const mudancaRef = db.collection('mudancas').doc(id);
        const doc = await mudancaRef.get();
        if (!doc.exists) { return res.status(404).send({ message: 'Mudança não encontrada.' }); }
        if (doc.data().status !== 'disponivel') { return res.status(400).send({ message: 'Este frete não está mais disponível.' }); }
        
        await mudancaRef.update({
            motoristaId,
            motoristaNome,
            status: 'aceita'
        });

        // ... (lógica de notificação mantida) ...
        const clienteId = doc.data().clienteId;
        await db.collection('notificacoes').add({
            userId: clienteId,
            mensagem: `Boas notícias! O motorista ${motoristaNome} aceitou seu frete.`,
            link: `/contrato/${id}`,
            lida: false,
            timestamp: new Date()
        });
        res.status(200).send({ message: 'Frete aceito com sucesso!' });
    } catch (error) {
        console.error("Erro ao aceitar frete:", error);
        res.status(500).send({ message: 'Erro no servidor ao aceitar frete', error: error.message });
    }
});


// --- OUTRAS ROTAS (DASHBOARDS, STATUS, ETC) ---
// ... (Suas outras rotas como /minhas-mudancas, /atualizar-status, etc., permanecem aqui) ...
// ... elas não precisam ser alteradas para esta funcionalidade ...
// ... mantendo seu código original para as demais rotas ...

module.exports = router;
// teste