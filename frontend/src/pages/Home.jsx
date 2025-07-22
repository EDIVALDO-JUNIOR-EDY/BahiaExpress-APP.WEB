import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaBuilding, FaBoxOpen } from 'react-icons/fa';

const Home = () => {
    const navigate = useNavigate();
    const CardButton = ({ onClick, icon, title, description, colorClass }) => (
        <button onClick={onClick} className={`${colorClass} text-white p-8 rounded-lg shadow-lg flex flex-col items-center text-center hover:opacity-90 transform hover:-translate-y-1`}>
            {icon}
            <h2 className="text-2xl font-semibold mt-4">{title}</h2>
            <p className="mt-2">{description}</p>
        </button>
    );
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-gray-800">BahiaExpress</h1>
                <p className="text-xl text-gray-600 mt-2">Sua Carga, Sua Mudança, Sua Solução.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                <CardButton onClick={() => navigate('/register')} icon={<FaBoxOpen size={50} />} title="Sou Cliente" description="Preciso de uma mudança segura." colorClass="bg-purple-600"/>
                <CardButton onClick={() => navigate('/register')} icon={<FaTruck size={50} />} title="Sou Motorista" description="Busco fretes e oportunidades." colorClass="bg-blue-600"/>
                <CardButton onClick={() => navigate('/register')} icon={<FaBuilding size={50} />} title="Sou Empresa" description="Quero gerenciar minhas cargas." colorClass="bg-green-600"/>
            </div>
             <p className="text-center mt-8">Já tem uma conta? <button onClick={() => navigate('/login')} className="text-blue-600 font-bold hover:underline">Faça Login</button></p>
        </div>
    );
};

export default Home;