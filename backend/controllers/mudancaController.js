// backend/controllers/mudancaController.js

const { db } = require('../firebaseConfig');

/**
 * Cria uma nova solicitação de mudança.
 * A lógica é executada após o middleware 'protect' verificar o usuário.
 */
exports.createMudanca = async (req, res) => {
  try {
    const { 
        origem, 
        destino, 
        itens, 
        solicitaEmpacotamento, 
        transportePet,
        transporteVeiculo 
    } = req.body;
    
    // Dados do usuário vêm do middleware 'protect', que já validou o token.
    const clienteId = req.user.uid;
    const clienteNome = req.user.name || 'Nome não informado';

    const novaMudanca = {
      clienteId,
      clienteNome,
      origem,
      destino,
      itens: itens || [],
      solicitaEmpacotamento: !!solicitaEmpacotamento,
      transportePet: !!transportePet,
      transporteVeiculo: !!transporteVeiculo,
      status: 'disponivel',
      createdAt: new Date(),
      motoristaId: null,
      motoristaNome: null,
    };

    const docRef = await db.collection('mudancas').add(novaMudanca);
    res.status(201).send({ message: 'Solicitação de mudança criada com sucesso!', id: docRef.id });
  } catch (error) {
    console.error("Erro no servidor ao criar mudança:", error);
    res.status(500).send({ message: 'Erro no servidor ao criar mudança', error: error.message });
  }
};

/**
 * Lista todos os fretes com status 'disponivel'.
 * Rota pública, não precisa de autenticação.
 */
exports.getAvailableMudancas = async (req, res) => {
    try {
        const snapshot = await db.collection('mudancas').where('status', '==', 'disponivel').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const mudancas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(mudancas);
    } catch (error) {
        console.error("Erro ao buscar mudanças disponíveis:", error);
        res.status(500).send({ message: 'Erro ao buscar mudanças', error: error.message });
    }
};

/**
 * Permite que um motorista autenticado aceite um frete.
 */
exports.acceptMudanca = async (req, res) => {
    const { id } = req.params; // ID da mudança vem da URL
    const motoristaId = req.user.uid; // ID do motorista vem do token
    const motoristaNome = req.user.name || 'Nome não informado';

    try {
        const mudancaRef = db.collection('mudancas').doc(id);
        const doc = await mudancaRef.get();

        if (!doc.exists) {
            return res.status(404).send({ message: 'Mudança não encontrada.' });
        }
        if (doc.data().status !== 'disponivel') {
            return res.status(400).send({ message: 'Este frete não está mais disponível.' });
        }
        
        await mudancaRef.update({
            motoristaId,
            motoristaNome,
            status: 'aceita'
        });

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
};

// Adicione aqui outras funções de controller para mudanças conforme necessário...