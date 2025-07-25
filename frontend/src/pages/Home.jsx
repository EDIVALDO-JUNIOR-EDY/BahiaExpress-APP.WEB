// CÓDIGO COMPLETO E DEFINITIVO para frontend/src/pages/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

// Importando os componentes que acabamos de aprimorar
import Header from '../components/home/Header';
import UserTypeCard from '../components/home/UserTypeCard';

// Importando os ícones
import { FaHouseUser, FaBuilding } from 'react-icons/fa';
import { FaTruckFast } from "react-icons/fa6";

const Home = () => {
    const navigate = useNavigate();

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