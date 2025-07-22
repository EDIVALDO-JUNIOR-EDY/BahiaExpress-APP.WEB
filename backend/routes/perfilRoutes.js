const express = require('express');
const { db } = require('../firebaseConfig');
const router = express.Router();


// --- ROTA EXISTENTE (MANTIDA) ---
// Busca o perfil PÚBLICO de um motorista, visualizado por um cliente.
router.get('/motorista/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userDoc = await db.collection('users').doc(id).get();

        if (!userDoc.exists || userDoc.data().userType !== 'motorista') {
            return res.status(404).send({ message: 'Motorista não encontrado.' });
        }

        const motoristaData = userDoc.data();
        
        // No futuro, estas avaliações virão da coleção 'avaliacoes'
        const avaliacoesSnapshot = await db.collection('avaliacoes').where('motoristaId', '==', id).get();
        const avaliacoes = avaliacoesSnapshot.docs.map(doc => doc.data());

        let mediaEstrelas = 0;
        if (avaliacoes.length > 0) {
            mediaEstrelas = avaliacoes.reduce((acc, curr) => acc + curr.estrelas, 0) / avaliacoes.length;
        }

        // Enviamos apenas os dados públicos, nunca a senha ou dados sensíveis
        const perfilPublico = {
            nome: motoristaData.nome,
            tipoVeiculo: motoristaData.tipo_veiculo || 'Não informado',
            membroDesde: motoristaData.createdAt.toDate().toLocaleDateString('pt-BR'),
            avaliacoes,
            mediaEstrelas: mediaEstrelas.toFixed(1)
        };

        res.status(200).send(perfilPublico);

    } catch (error) {
        console.error("Erro ao buscar perfil do motorista:", error);
        res.status(500).send({ message: 'Erro no servidor', error: error.message });
    }
});


// ========================================================================= //
// ========= NOVAS ROTAS ADICIONADAS PARA O GERENCIAMENTO DO PERFIL ======== //
// ========================================================================= //

// ROTA NOVA: Busca os dados completos do PRÓPRIO usuário logado para a página "Meu Perfil"
router.get('/meu-perfil/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) { 
            return res.status(404).send({ message: 'Usuário não encontrado.' });
        }
        
        // Retorna todos os dados do usuário, pois ele está vendo o próprio perfil
        res.status(200).send({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
        console.error("Erro ao buscar meu perfil:", error);
        res.status(500).send({ message: 'Erro no servidor', error: error.message });
    }
});

// ROTA NOVA: Atualiza os dados do PRÓPRIO usuário logado a partir da página "Meu Perfil"
router.put('/meu-perfil/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const dadosParaAtualizar = req.body; // ex: { nome: "Novo Nome", telefone: "12345", tipo_veiculo: "Van" }

        // Remove campos que não devem ser atualizados diretamente, por segurança
        delete dadosParaAtualizar.email;
        delete dadosParaAtualizar.uid;
        delete dadosParaAtualizar.userType;

        await db.collection('users').doc(userId).update(dadosParaAtualizar);

        res.status(200).send({ message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).send({ message: 'Erro no servidor', error: error.message });
    }
});
// ========================================================================= //


module.exports = router;