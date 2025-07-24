import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// --- Importação dos Componentes de Layout e Lógica ---
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// --- Importação de TODAS as Páginas ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Contrato from './pages/Contrato';
import PerfilMotorista from './pages/PerfilMotorista';
import ClienteDashboard from './pages/cliente/ClienteDashboard';
import SolicitarMudanca from './pages/cliente/SolicitarMudanca';
import MotoristaDashboard from './pages/motorista/MotoristaDashboard';
import BuscarFretes from './pages/motorista/BuscarFretes';
import Chat from './pages/Chat'; // <-- NOVA IMPORTAÇÃO para a página de CHAT

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* A Navbar aparece em todas as páginas */}
        <Navbar />

        {/* O 'main' contém o conteúdo da página atual */}
        <main className="p-4">
          <Routes>
            {/* ======================= */}
            {/* ==== Rotas Públicas ==== */}
            {/* ======================= */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* ================================================================= */}
            {/* ==== Rotas Protegidas (só acessa se estiver logado) ==== */}
            {/* ================================================================= */}
            
            <Route path="/perfil/motorista/:id" element={<ProtectedRoute allowedRoles={['cliente', 'empresa']}><PerfilMotorista /></ProtectedRoute>} />
            <Route path="/contrato/:mudancaId" element={<ProtectedRoute allowedRoles={['cliente', 'motorista', 'empresa']}><Contrato /></ProtectedRoute>} />

            {/* --- Rotas do Cliente --- */}
            <Route path="/cliente/dashboard" element={<ProtectedRoute allowedRoles={['cliente']}><ClienteDashboard /></ProtectedRoute>} />
            <Route path="/cliente/solicitar-mudanca" element={<ProtectedRoute allowedRoles={['cliente']}><SolicitarMudanca /></ProtectedRoute>} />
            
            {/* --- Rotas do Motorista --- */}
            <Route path="/motorista/dashboard" element={<ProtectedRoute allowedRoles={['motorista', 'empresa']}><MotoristaDashboard /></ProtectedRoute>} />
            <Route path="/motorista/buscar-fretes" element={<ProtectedRoute allowedRoles={['motorista', 'empresa']}><BuscarFretes /></ProtectedRoute>} />

            {/* --- ROTA FINAL PARA O CHAT --- */}
            <Route 
              path="/chat/:mudancaId" 
              element={<ProtectedRoute allowedRoles={['cliente', 'motorista', 'empresa']}><Chat /></ProtectedRoute>} 
            />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;