import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; // <-- MUDANÇA AQUI
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [notificacoes, setNotificacoes] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotificacoes = async () => {
        if (!currentUser) return;
        try {
            // MUDANÇA AQUI:
            const response = await api.get(`/notificacoes/${currentUser.uid}`);
            setNotificacoes(response.data);
        } catch (error) {
            console.error("Erro ao buscar notificações", error);
        }
    };

    useEffect(() => {
        if(currentUser) {
            fetchNotificacoes();
            const interval = setInterval(fetchNotificacoes, 60000);
            return () => clearInterval(interval);
        }
    }, [currentUser]);

    const handleNotificationClick = async (notificacao) => {
        try {
            // MUDANÇA AQUI:
            await api.post(`/notificacoes/marcar-como-lida/${notificacao.id}`);
            setIsOpen(false);
            fetchNotificacoes();
            navigate(notificacao.link);
        } catch (error) {
            console.error("Erro ao marcar notificação", error);
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-600 hover:text-blue-600">
                <FaBell size={24} />
                {notificacoes.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 justify-center items-center text-white text-xs">
                            {notificacoes.length}
                        </span>
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20">
                    <div className="p-2 font-bold border-b">Notificações</div>
                    {notificacoes.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto">
                            {notificacoes.map(n => (
                                <div key={n.id} onClick={() => handleNotificationClick(n)} className="p-3 hover:bg-gray-100 cursor-pointer border-b">
                                    <p className="text-sm">{n.mensagem}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt.seconds * 1000).toLocaleString('pt-BR')}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="p-4 text-sm text-gray-500">Nenhuma nova notificação.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;