// Em frontend/src/pages/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaBuilding, FaHome } from 'react-icons/fa'; // Ícones mais adequados
import AnimatedLogo from '../components/AnimatedLogo'; // Importando a logo animada

const Home = () => {
    const navigate = useNavigate();

    // Componente de Cartão reutilizável com o novo design
    const ProfileCard = ({ onClick, icon, title, description }) => (
        <button
            onClick={onClick}
            className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2"
        >
            <div className="text-blue-600 mb-4">
                {icon}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="mt-2 text-gray-500">{description}</p>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <header className="text-center mb-10">
                {/* 1. LOGO ANIMADA AQUI, COM O DOBRO DO TAMANHO */}
                <AnimatedLogo size="200px" />

                <h1 className="text-4xl font-bold text-gray-800 mt-4">BahiaExpress</h1>
                <p className="text-lg text-gray-600 mt-2">
                    A solução completa para suas cargas e mudanças na Bahia.
                </p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {/* Cartões com os textos e ícones da imagem de referência */}
                <ProfileCard
                    onClick={() => navigate('/register', { state: { userType: 'motorista' } })}
                    icon={<FaUserTie size={40} />}
                    title="Motorista Autônomo"
                    description="Pronto para rodar mais e lucrar mais?"
                />
                <ProfileCard
                    onClick={() => navigate('/register', { state: { userType: 'empresa' } })}
                    icon={<FaBuilding size={40} />}
                    title="Empresa de Transporte"
                    description="Encontre os melhores motoristas para suas cargas."
                />
                <ProfileCard
                    onClick={() => navigate('/register', { state: { userType: 'cliente' } })}
                    icon={<FaHome size={40} />}
                    title="Vou me Mudar"
                    description="Planeje sua mudança e encontre o transporte ideal."
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
                    © 2025 BahiaExpress. Todos os direitos reservados.
                </p>
            </footer>
        </div>
    );
};

export default Home;