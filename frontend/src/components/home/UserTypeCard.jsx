// CÓDIGO COMPLETO E ATUALIZADO para frontend/src/components/home/UserTypeCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserTypeCard = ({ icon, title, description, userType, borderColorClass }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // Navega para a página de registro passando o tipo de usuário no estado
        navigate('/register', { state: { userType } });
    };

    return (
        // O container externo com o padding cria o efeito da borda gradiente
        <div className={`p-1 rounded-xl bg-gradient-to-br ${borderColorClass}`}>
            <button
                onClick={handleClick}
                className="w-full h-full bg-white p-6 rounded-lg flex flex-col items-center text-center group transition-shadow duration-300 hover:shadow-2xl"
            >
                <div className="text-blue-600 mb-4 transition-transform duration-300 group-hover:scale-110">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <p className="mt-2 text-gray-500">{description}</p>
            </button>
        </div>
    );
};

export default UserTypeCard;