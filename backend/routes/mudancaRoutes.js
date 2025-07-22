const express = require('express');
const { db } = require('../firebaseConfig');
const router = express.Router();

// --- ROTA DE CRIAÇÃO DE MUDANÇA ---
router.post('/criar', async (req, res) => {
  try {
    const {
      clienteId, origem, destino, itens, solicitaEmpacotamento,
      transportePet, transporteVeiculo, distanciaAcima30km, valorPropostoCliente
    } = req.body;
    const novaMudanca = {
      clienteId, origem, destino, itens, solicitaEmpacotamento, transportePet,
      transporteVeiculo, distanciaAcima30km, valorPropostoCliente,
      status: 'aguardando_motorista',
      createdAt: new Date(),
      negociacao: { status: distanciaAcima30km ? 'aberta' : 'nao_aplicavel', propostaMotorista: null, clienteAceitou: false }
    };
    const docRef = await db.collection('mudancas').add(novaMudanca);
    res.status(201).send({ message: 'Solicitação de mudança criada com sucesso!', id: docRef.id });
  } catch (error) {
    res.status(500).send({ message: 'Erro no servidor ao criar mudança', error: error.message });
  }
});

// --- ROTAS DE NEGOCIAÇÃO ---
router.post('/propor-valor/:id', async (req, res) => {
  const { id } = req.params;
  const { propostaMotorista, motoristaId } = req.body;
  try {
    await db.collection('mudancas').doc(id).update({
      'negociacao.propostaMotorista': propostaMotorista,
      'negociacao.status': 'proposta_enviada',
      motoristaId: motoristaId
    });
    res.status(200).send({ message: 'Proposta enviada com sucesso!' });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao enviar proposta', error: error.message });
  }
});

router.post('/aceitar-proposta/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('mudancas').doc(id).update({
      'negociacao.clienteAceitou': true,
      'negociacao.status': 'finalizada',
      'status': 'aguardando_assinatura_contrato'
    });
    res.status(200).send({ message: 'Proposta aceita! Contrato pronto para assinatura.' });
  } catch (error) {
    res.status(500).send({ message: 'Erro ao aceitar proposta', error: error.message });
  }
});

// --- ROTAS DE BUSCA E ACEITE DE FRETE ---
router.get('/disponiveis', async (req, res) => {
  try {
    const snapshot = await db.collection('mudancas').where('status', '==', 'aguardando_motorista').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return res.status(200).send([]);
    const mudancas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(mudancas);
  } catch (error) {
    res.status(500).send({ message: 'Erro ao buscar mudanças', error: error.message });
  }
});

router.post('/aceitar/:id', async (req, res) => {
    const { id } = req.params;
    const { motoristaId } = req.body;
    if (!motoristaId) {
        return res.status(400).send({ message: 'A identificação do motorista é obrigatória.' });
    }
    try {
        const mudancaRef = db.collection('mudancas').doc(id);
        const doc = await mudancaRef.get();
        if (!doc.exists) { return res.status(404).send({ message: 'Mudança não encontrada.' }); }
        if (doc.data().status !== 'aguardando_motorista') { return res.status(400).send({ message: 'Este frete não está mais disponível.' }); }
        await mudancaRef.update({
            motoristaId: motoristaId,
            status: 'aguardando_assinatura_contrato'
        });
        const clienteId = doc.data().clienteId;
        await db.collection('notificacoes').add({
            paraUsuarioId: clienteId,
            mensagem: `Boas notícias! Um motorista aceitou seu frete de ${doc.data().origem}.`,
            link: `/contrato/${id}`,
            lida: false,
            createdAt: new Date()
        });
        res.status(200).send({ message: 'Frete aceito com sucesso! O contrato está pronto para assinatura.' });
    } catch (error) {
        console.error("Erro ao aceitar frete:", error);
        res.status(500).send({ message: 'Erro no servidor ao aceitar frete', error: error.message });
    }
});

// --- ROTAS DOS PAINÉIS (DASHBOARDS) ---
router.get('/minhas-mudancas/cliente/:clienteId', async (req, res) => {
    try {
        const { clienteId } = req.params;
        const snapshot = await db.collection('mudancas').where('clienteId', '==', clienteId).orderBy('createdAt', 'desc').get();
        if (snapshot.empty) return res.status(200).send([]);
        const mudancas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(mudancas);
    } catch (error) {
        console.error("Erro ao buscar mudanças do cliente:", error);
        res.status(500).send({ message: 'Erro no servidor', error: error.message });
    }
});

router.get('/minhas-mudancas/motorista/:motoristaId', async (req, res) => {
    try {
        const { motoristaId } = req.params;
        const snapshot = await db.collection('mudancas').where('motoristaId', '==', motoristaId).orderBy('createdAt', 'desc').get();
        if (snapshot.empty) return res.status(200).send([]);
        const mudancas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(mudancas);
    } catch (error) {
        console.error("Erro ao buscar mudanças do motorista:", error);
        res.status(500).send({ message: 'Erro no servidor', error: error.message });
    }
});

// --- ROTAS DE FINALIZAÇÃO E STATUS ---
router.post('/finalizar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection('mudancas').doc(id).update({
            status: 'finalizada' 
        });
        res.status(200).send({ message: 'Serviço finalizado com sucesso!' });
    } catch (error) {
        console.error("Erro ao finalizar serviço:", error);
        res.status(500).send({ message: 'Erro no servidor ao finalizar serviço.', error: error.message });
    }
});

// ROTA NOVA: Para atualizar o status de uma mudança (ex: "em_transito")
router.put('/atualizar-status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).send({ message: 'O novo status é obrigatório.' });
    }

    try {
        const mudancaRef = db.collection('mudancas').doc(id);
        await mudancaRef.update({ status });

        // Futuramente, aqui também podemos criar uma notificação para o cliente
        const doc = await mudancaRef.get();
        if (doc.exists) {
            const clienteId = doc.data().clienteId;
            await db.collection('notificacoes').add({
                paraUsuarioId: clienteId,
                mensagem: `O status do seu frete de ${doc.data().origem} foi atualizado para: ${status.replace(/_/g, ' ')}.`,
                link: `/cliente/dashboard`,
                lida: false,
                createdAt: new Date()
            });
        }
        
        res.status(200).send({ message: `Status da mudança atualizado para ${status}` });
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        res.status(500).send({ message: 'Erro no servidor.', error: error.message });
    }
});

module.exports = router;