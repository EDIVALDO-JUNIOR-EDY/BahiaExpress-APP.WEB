const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Importação de TODAS as suas rotas ---
const authRoutes = require('./routes/authRoutes');
const mudancaRoutes = require('./routes/mudancaRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');
const chatRoutes = require('./routes/chatRoutes'); // <-- NOVA IMPORTAÇÃO para o CHAT

const app = express();

// --- Configurações do Express (Middlewares) ---
app.use(cors());
app.use(express.json());


// --- Registro dos "caminhos" da sua API ---
app.use('/api/auth', authRoutes);
app.use('/api/mudancas', mudancaRoutes);
app.use('/api/contrato', contratoRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/notificacoes', notificacaoRoutes);
app.use('/api/chat', chatRoutes); // <-- NOVO REGISTRO DA ROTA para o CHAT


// --- Rota de teste para verificar se a API está online ---
app.get('/', (req, res) => {
  res.send('API do BahiaExpress está funcionando!');
});


// --- Inicialização do servidor ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
// Forçando atualização para o deploy.