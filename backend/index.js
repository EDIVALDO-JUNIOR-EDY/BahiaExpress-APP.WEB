/**
 * @versao 2.0
 * @autor Dev.Sênior (IA)
 * @data 06/08/2025
 *
 * @descricao Ponto de entrada principal do servidor backend (API) do BahiaExpres.
 *              Configura o Express, o CORS, registra as rotas e inicia o servidor.
 * @principais_funcoes - Inicializar o servidor Express.
 *                     - Configurar o CORS para permitir requisições do frontend.
 *                     - Registrar todas as rotas da aplicação.
 *
 * @conecta_com Todas as rotas em ./routes/
 * @refatorado Sim
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carrega as variáveis do arquivo .env localmente

// --- Importação de Rotas ---
const authRoutes = require('./routes/authRoutes');
const mudancaRoutes = require('./routes/mudancaRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- Configuração de CORS (Cross-Origin Resource Sharing) ---
// Define qual URL de frontend tem permissão para acessar esta API.
const allowedOrigins = [
    'http://localhost:5173', // Para desenvolvimento local
    process.env.FRONTEND_URL // Para produção (ex: https://bahiaexpress-app.onrender.com)
];

const corsOptions = {
    origin: (origin, callback) => {
        // Permite requisições sem 'origin' (ex: Postman, apps móveis) ou se a origem estiver na lista
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido pela política de CORS'));
        }
    },
    credentials: true, // Necessário para enviar cookies ou headers de autorização
};

app.use(cors(corsOptions));

// --- Middlewares ---
app.use(express.json()); // Permite que o servidor entenda requisições com corpo em JSON

// --- Registro das Rotas da API ---
app.use('/api/auth', authRoutes);
app.use('/api/mudancas', mudancaRoutes);
app.use('/api/contrato', contratoRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/notificacoes', notificacaoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// --- Rota Raiz para Verificação de Status ---
app.get('/', (req, res) => {
  res.status(200).send('API do BahiaExpress está online e funcional!');
});

// --- Inicialização do Servidor ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Frontend autorizado: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

/**
 * @fim_do_arquivo index.js
 * @versao 2.0
 */