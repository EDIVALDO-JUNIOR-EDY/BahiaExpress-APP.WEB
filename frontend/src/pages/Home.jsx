// C:/dev/frontend/src/pages/Home.jsx

import React, { useEffect } from 'react'; // 1. Importar useEffect
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // 2. Importar o hook de autenticação

// Importando componentes e ícones (preservados)
import Header from '../components/home/Header';
import UserTypeCard from '../components/home/UserTypeCard';
import { FaHouseUser, FaBuilding } from 'react-icons/fa';
import { FaTruckFast } from "react-icons/fa6";
import LoadingSpinner from '../components/shared/LoadingSpinner'; // Para uma melhor UX

const Home = () => {
    const navigate = useNavigate();
    const { currentUser, loading } = useAuth(); // 3. Usar o contexto para pegar o usuário e o estado de loading

    // 4. EFEITO DE REDIRECIONAMENTO AUTOMÁTICO
    useEffect(() => {
        // Apenas executa a lógica se o carregamento inicial do auth já terminou
        if (!loading && currentUser) {
            console.log(`[Home Page] Usuário logado (${currentUser.userType}) detectado. Redirecionando...`);
            if (currentUser.userType === 'cliente') {
                navigate('/cliente/dashboard');
            } else if (currentUser.userType === 'motorista' || currentUser.userType === 'empresa') {
                navigate('/motorista/dashboard');
            }
        }
    }, [currentUser, loading, navigate]); // Roda quando qualquer uma dessas variáveis mudar

    // 5. RENDERIZAÇÃO CONDICIONAL
    // Enquanto o AuthContext verifica o estado do usuário, mostramos um spinner
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Se o usuário estiver logado, o useEffect vai redirecionar, então não renderizamos nada
    // para evitar que a página "pisque" na tela.
    if (currentUser) {
        return null;
    }

    // Se não estiver carregando E não houver usuário, renderiza a página de boas-vindas
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="container mx-auto">
                <Header />

                <main className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                    <UserTypeCard
                        userType="cliente"
                        title="Sou Cliente"
                        description="Quero fazer minha mudança"
                        icon={<FaHouseUser size={50} />}
                        borderColorClass="from-orange-400 via-white to-blue-500"
                    />
                    <UserTypeCard
                        userType="motorista"
                        title="Sou Motorista"
                        description="Pronto para rodar e lucrar mais"
                        icon={<FaTruckFast size={50} className="transition-transform group-hover:animate-bounce" />}
                        borderColorClass="from-orange-400 via-white to-blue-500"
                    />
                    <UserTypeCard
                        userType="empresa"
                        title="Sou Empresa"
                        description="Encontre os melhores motoristas"
                        icon={<FaBuilding size={50} className="transition-transform group-hover:animate-pulse" />}
                        borderColorClass="from-orange-400 via-white to-blue-500"
                    />
                </main>

                <footer className="text-center mt-12">
                    <p className="text-gray-600">
                        Já tem uma conta?{' '}
                        <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:underline">
                            Faça Login
                        </button>
                    </p>
                     <p className="text-sm text-gray-400 mt-8">
                        © {new Date().getFullYear()} BahiaExpress. Todos os direitos reservados.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Home;