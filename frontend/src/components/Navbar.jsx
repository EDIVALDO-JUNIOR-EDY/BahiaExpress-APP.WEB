import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';
import { FaTruck, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

// Importa o componente do sino de notificação que criamos
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Sua função de logout, que está perfeita, é mantida
    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo e Link para a Home */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-blue-600">
                            <FaTruck />
                            <span>BahiaExpress</span>
                        </Link>
                    </div>

                    {/* Links de Navegação */}
                    <div className="flex items-center">
                        {currentUser ? (
                            // -- MOSTRAR SE O USUÁRIO ESTIVER LOGADO --
                            <div className="flex items-center space-x-4">
                                {/* O SINO DE NOTIFICAÇÃO É ADICIONADO AQUI */}
                                <NotificationBell />
                                
                                <span className="text-gray-700 hidden sm:block">Olá, {currentUser.nome || currentUser.displayName}!</span>
                                
                                {currentUser.userType === 'cliente' && (
                                    <Link to="/cliente/dashboard" className="text-gray-600 hover:text-blue-600 flex items-center"><FaTachometerAlt className="mr-1"/> Meu Painel</Link>
                                )}
                                {currentUser.userType === 'motorista' && (
                                     <Link to="/motorista/dashboard" className="text-gray-600 hover:text-blue-600 flex items-center"><FaTachometerAlt className="mr-1"/> Meus Fretes</Link>
                                )}

                                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-semibold flex items-center">
                                    <FaSignOutAlt className="mr-1" />
                                    Sair
                                </button>
                            </div>
                        ) : (
                            // -- MOSTRAR SE O USUÁRIO ESTIVER DESLOGADO --
                            <div className="space-x-4">
                                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-semibold">Login</Link>
                                <Link to="/register" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Registrar</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;