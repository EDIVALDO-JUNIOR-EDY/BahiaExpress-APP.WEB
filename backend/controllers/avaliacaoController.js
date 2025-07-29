// backend/controllers/avaliacaoController.js

const { db } = require('../firebaseConfig');

/**
 * Permite que um cliente autenticado crie uma nova avaliação para uma mudança.
 * A rota é protegida pelo middleware 'protect'.
 * POST /api/avaliacoes/
 */
exports.createAvaliacao = async (req, res) => {
    // O ID do cliente é obtido do token decodificado pelo middleware 'protect'.
    // Isto é mais seguro do que confiar no que vem do frontend.
    const clienteId = req.user.uid;
    const { mudancaId, motoristaId, estrelas, comentario } = req.body;

    // --- Validação robusta dos dados de entrada ---
    if (!mudancaId || !motoristaId || !estrelas) {
        return res.status(400).json({ message: 'ID da mudança, ID do motorista e nota (estrelas) são obrigatórios.' });
    }
    const notaNumerica = Number(estrelas);
    if (isNaN(notaNumerica) || notaNumerica < 1 || notaNumerica > 5) {
        return res.status(400).json({ message: 'A nota (estrelas) deve ser um número entre 1 e 5.' });
    }

    try {
        const mudancaRef = db.collection('mudancas').doc(mudancaId);
        const doc = await mudancaRef.get();

        // --- Verificações de Lógica de Negócio ---
        if (!doc.exists) {
            return res.status(404).json({ message: "A mudança associada a esta avaliação não foi encontrada." });
        }
        if (doc.data().avaliada) {
            return res.status(409).json({ message: "Esta mudança já foi avaliada." });
        }
        // Garante que quem está avaliando é o cliente real da mudança.
        if (doc.data().clienteId !== clienteId) {
            return res.status(403).json({ message: "Acesso negado. Você não pode avaliar uma mudança que não é sua." });
        }

        const novaAvaliacao = {
            mudancaId,
            motoristaId,
            clienteId,
            estrelas: notaNumerica,
            comentario: comentario || '',
            createdAt: new Date(),
        };

        // --- Execução da Transação no Banco de Dados ---
        await db.collection('avaliacoes').add(novaAvaliacao);
        await mudancaRef.update({ avaliada: true });

        res.status(201).json({ message: 'Avaliação enviada com sucesso!' });

    } catch (error) {
        console.error("Erro ao criar avaliação:", error);
        res.status(500).json({ message: 'Erro no servidor ao salvar avaliação.' });
    }
};

/**
 * Busca todas as avaliações de um motorista específico.
 * Esta rota é pública e não requer autenticação.
 * GET /api/avaliacoes/:motoristaId
 */
exports.getAvaliacoesPorMotorista = async (req, res) => {
    const { motoristaId } = req.params;
    try {
        const snapshot = await db.collection('avaliacoes')
            .where('motoristaId', '==', motoristaId)
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const avaliacoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(avaliacoes);

    } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
        res.status(500).json({ message: 'Erro no servidor ao buscar avaliações.' });
    }
};