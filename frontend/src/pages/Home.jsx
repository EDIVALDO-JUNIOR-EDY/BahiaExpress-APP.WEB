// Em: frontend/src/pages/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaHouseUser } from 'react-icons/fa';
import { FaTruckFast } from "react-icons/fa6"; // Ícone de caminhão em movimento
import AnimatedLogo from '../components/AnimatedLogo';

const Home = () => {
    const navigate = useNavigate();

    // Componente de Card totalmente redesenhado
    const ProfileCard = ({ icon, title, description, onClick, borderColor }) => (
        // O container do card que cria o efeito da borda gradiente
        <div className={`p-1 rounded-xl bg-gradient-to-br ${borderColor}`}>
            <button
                onClick={onClick}
                className="w-full h-full bg-white p-6 rounded-lg flex flex-col items-center group"
            >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
                <div className="text-blue-800 transition-transform duration-300 group-hover:scale-110">
                    {icon}
                </div>
                <p className="mt-4 text-gray-500 font-medium">{description}</p>
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <header className="text-center mb-10">
                {/* 3. LOGO CENTRALIZADA E MAIOR */}
                <AnimatedLogo size="250px" />

                <h1 className="text-5xl font-extrabold text-gray-800 mt-2" style={{ color: '#002244' }}>
                    BahiaExpress
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                    A solução completa para suas cargas e mudanças na Bahia.
                </p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {/* 4. SEQUÊNCIA E CONTEÚDO CORRIGIDOS */}
                <ProfileCard
                    onClick={() => navigate('/register', { state: { userType: 'cliente' } })}
                    title="Sou Cliente"
                    description="Quero fazer minha mudança"
                    icon={<FaHouseUser size={50} />}
                    borderColor="from-orange-400 via-white to-blue-500"
                />
                <ProfileCard
                    onClick={() => navigate('/register', { state: { userType: 'motorista' } })}
                    title="Sou Motorista"
                    description="Pronto para rodar e lucrar mais"
                    // Ícone com animação de "chacoalhar" no hover
                    icon={<FaTruckFast size={50} className="transition-transform group-hover:-translate-x-1" />}
                    borderColor="from-orange-400 via-white to-blue-500"
                />
                <ProfileCard
                    onClick={() => navigate('/register', { state: { userType: 'empresa' } })}
                    title="Sou Empresa"
                    description="Encontre os melhores motoristas"
                    // Ícone com animação de "pulso" no hover
                    icon={<FaBuilding size={50} className="transition-transform group-hover:animate-pulse" />}
                    borderColor="from-orange-400 via-white to-blue-500"
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