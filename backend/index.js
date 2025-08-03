// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Importação de TODAS as suas rotas ---
const authRoutes = require('./routes/authRoutes');
const mudancaRoutes = require('./routes/mudancaRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Configuração de CORS aprimorada
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// --- Registro dos "caminhos" da sua API ---
app.use('/api/auth', authRoutes);
app.use('/api/mudancas', mudancaRoutes);
app.use('/api/contrato', contratoRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/notificacoes', notificacaoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// --- Rota de teste para verificar se a API está online ---
app.get('/', (req, res) => {
  res.send('API do BahiaExpress está funcionando!');
});

// --- Inicialização do servidor ---
const PORT = process.env.PORT || 10000; // Alterado para 10000 (Render)
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));