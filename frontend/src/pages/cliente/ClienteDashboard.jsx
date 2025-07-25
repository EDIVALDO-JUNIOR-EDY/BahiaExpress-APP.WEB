// Em: C:\dev\frontend\src\pages\cliente\ClienteDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import AvaliacaoModal from '../../components/AvaliacaoModal';
import AnimatedLogo from '../../components/AnimatedLogo'; // <-- 1. IMPORTAÇÃO DA LOGO ANIMADA

const ClienteDashboard = () => {
    const { currentUser } = useAuth();
    const [mudancas, setMudancas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [mudancaParaAvaliar, setMudancaParaAvaliar] = useState(null);

    // Nenhuma alteração na lógica de busca de dados. Funcionalidade 100% preservada.
    const fetchMinhasMudancas = async () => {
        if (!currentUser) return;
        try {
            setLoading(true);
            const response = await api.get(`/mudancas/minhas-mudancas/cliente/${currentUser.uid}`);
            setMudancas(response.data);
        } catch (error) {
            console.error("Erro ao buscar minhas mudanças:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMinhasMudancas();
    }, [currentUser]);

    // Nenhuma alteração na lógica do modal. Funcionalidade 100% preservada.
    const handleOpenModal = (mudanca) => {
        setMudancaParaAvaliar(mudanca);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setMudancaParaAvaliar(null);
    };
    const handleSuccess = () => {
        handleCloseModal();
        fetchMinhasMudancas();
    };

    if (loading) return <p className="p-8 text-center text-lg">Carregando seu painel...</p>;

    return (
        <>
            {/* O modal continua funcionando da mesma forma */}
            {showModal && (
                <AvaliacaoModal 
                    mudanca={mudancaParaAvaliar} 
                    currentUser={currentUser}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
            
            <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
                
                {/* 2. NOVO CABEÇALHO COM A LOGO E TÍTULO ALINHADOS */}
                <div className="flex items-center gap-4 mb-8">
                    <AnimatedLogo size="80px" />
                    <h1 className="text-3xl font-bold text-gray-800">Meu Painel de Mudanças</h1>
                </div>

                {/* O restante da lógica de exibição está 100% preservado */}
                {mudancas.length === 0 ? ( 
                    <div className="text-center bg-white p-8 rounded-lg shadow">
                        <p className="text-gray-600 text-lg">Você ainda não solicitou nenhuma mudança.</p>
                        <Link to="/cliente/solicitar-mudanca" className="mt-4 inline-block bg-purple-600 text-white font-bold py-2 px-4 rounded hover:bg-purple-700 transition-colors">
                            Solicitar Minha Primeira Mudança
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {mudancas.map(m => (
                            <div key={m.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500 transition-shadow hover:shadow-lg">
                                <p>De: <span className="font-semibold">{m.origem}</span></p>
                                <p>Para: <span className="font-semibold">{m.destino}</span></p>
                                <p className="mt-2">Status: <span className="font-bold text-blue-600 capitalize">{m.status.replace(/_/g, ' ')}</span></p>
                                
                                <div className="mt-4 pt-4 border-t flex items-center flex-wrap gap-4">
                                    {/* Toda a lógica condicional de botões foi mantida */}
                                    {m.status === 'aguardando_assinatura_contrato' && (
                                        <Link to={`/contrato/${m.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-semibold transition-colors">Assinar Contrato</Link>
                                    )}
                                    {m.status !== 'aguardando_motorista' && m.status !== 'finalizada' && !m.avaliada && (
                                        <Link to={`/chat/${m.id}`} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-semibold transition-colors">
                                            Conversar com Motorista
                                        </Link>
                                    )}
                                    {m.status === 'finalizada' && !m.avaliada && (
                                        <button onClick={() => handleOpenModal(m)} className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 font-semibold transition-colors">Avaliar Serviço</button>
                                    )}
                                    {m.status === 'finalizada' && m.avaliada && (
                                        <p className="text-green-700 font-semibold">Avaliação Enviada. Obrigado!</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default ClienteDashboard;