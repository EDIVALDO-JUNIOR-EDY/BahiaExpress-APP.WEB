// CÓDIGO COMPLETO, OTIMIZADO E DEFINITIVO para C:\dev\frontend\src\App.jsx

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MudancaProvider } from './contexts/MudancaContext';

// --- Componentes Essenciais (carregados imediatamente) ---
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
// A importação do nosso spinner padronizado
import LoadingSpinner from './components/shared/LoadingSpinner';

// Componente de teste do Tailwind
import TailwindTest from './components/shared/TailwindTest';


// --- Páginas Carregadas sob Demanda (Code Splitting com React.lazy) ---
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Contrato = React.lazy(() => import('./pages/Contrato'));
const PerfilMotorista = React.lazy(() => import('./pages/PerfilMotorista'));
const ClienteDashboard = React.lazy(() => import('./pages/cliente/ClienteDashboard'));
const SolicitarMudanca = React.lazy(() => import('./pages/cliente/SolicitarMudanca'));
const MotoristaDashboard = React.lazy(() => import('./pages/motorista/MotoristaDashboard'));
const BuscarFretes = React.lazy(() => import('./pages/motorista/BuscarFretes'));
const Chat = React.lazy(() => import('./pages/Chat'));
const MeuPerfil = React.lazy(() => import('./pages/MeuPerfil'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <MudancaProvider>
          <Navbar />
          {/* Suspense usa o LoadingSpinner enquanto o código da próxima página é baixado */}
          <Suspense fallback={<LoadingSpinner />}>
            <main className="pt-16"> {/* Padding para conteúdo não ficar atrás da Navbar */}
              <Routes>
                {/* ======================= */}
                {/* ==== Rotas Públicas ==== */}
                {/* ======================= */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/perfil/motorista/:id" element={<PerfilMotorista />} />

                {/* ================================================================= */}
                {/* ==== Rotas Protegidas (só acessa se estiver logado) ==== */}
                {/* ================================================================= */}
                
                <Route path="/contrato/:mudancaId" element={<ProtectedRoute allowedRoles={['cliente', 'motorista', 'empresa']}><Contrato /></ProtectedRoute>} />
                <Route path="/meu-perfil" element={<ProtectedRoute allowedRoles={['cliente', 'motorista', 'empresa']}><MeuPerfil /></ProtectedRoute>} />

                {/* --- Rotas do Cliente --- */}
                <Route path="/cliente/dashboard" element={<ProtectedRoute allowedRoles={['cliente']}><ClienteDashboard /></ProtectedRoute>} />
                <Route path="/cliente/solicitar-mudanca" element={<ProtectedRoute allowedRoles={['cliente']}><SolicitarMudanca /></ProtectedRoute>} />
                
                {/* --- Rotas do Motorista / Empresa --- */}
                <Route path="/motorista/dashboard" element={<ProtectedRoute allowedRoles={['motorista', 'empresa']}><MotoristaDashboard /></ProtectedRoute>} />
                <Route path="/motorista/buscar-fretes" element={<ProtectedRoute allowedRoles={['motorista', 'empresa']}><BuscarFretes /></ProtectedRoute>} />

                {/* --- ROTA PARA O CHAT --- */}
                <Route path="/chat/:mudancaId" element={<ProtectedRoute allowedRoles={['cliente', 'motorista', 'empresa']}><Chat /></ProtectedRoute>} />

                {/* Rota "catch-all" para páginas não encontradas */}
                <Route path="*" element={<div className="text-center p-10"><h1>404 - Página Não Encontrada</h1></div>} />
              </Routes>
            </main>
          </Suspense>
        </MudancaProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;