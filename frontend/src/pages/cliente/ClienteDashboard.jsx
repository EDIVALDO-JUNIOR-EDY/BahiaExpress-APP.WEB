import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api'; // <-- MUDANÇA AQUI
import { Link } from 'react-router-dom';
import AvaliacaoModal from '../../components/AvaliacaoModal';

const ClienteDashboard = () => {
    const { currentUser } = useAuth();
    const [mudancas, setMudancas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [mudancaParaAvaliar, setMudancaParaAvaliar] = useState(null);

    const fetchMinhasMudancas = async () => {
        if (!currentUser) return;
        try {
            setLoading(true);
            // MUDANÇA AQUI:
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

    if (loading) return <p className="p-8 text-center">Carregando seu painel...</p>;

    return (
        <>
            {showModal && (
                <AvaliacaoModal 
                    mudanca={mudancaParaAvaliar} 
                    currentUser={currentUser}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
            <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold mb-6">Meu Painel de Mudanças</h1>
                {mudancas.length === 0 ? ( <p>Você ainda não solicitou nenhuma mudança.</p> ) : (
                    <div className="space-y-4">
                        {mudancas.map(m => (
                            <div key={m.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
                                <p>De: <span className="font-semibold">{m.origem}</span> Para: <span className="font-semibold">{m.destino}</span></p>
                                <p>Status: <span className="font-bold text-blue-600">{m.status.replace(/_/g, ' ')}</span></p>
                                <div className="mt-4 pt-4 border-t flex items-center flex-wrap gap-4">
                                    {m.status === 'aguardando_assinatura_contrato' && (
                                        <Link to={`/contrato/${m.id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Assinar Contrato</Link>
                                    )}
                                    {m.status !== 'aguardando_motorista' && m.status !== 'finalizada' && (
                                        <Link to={`/chat/${m.id}`} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                                            Conversar com Motorista
                                        </Link>
                                    )}
                                    {m.status === 'finalizada' && !m.avaliada && (
                                        <button onClick={() => handleOpenModal(m)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Avaliar Serviço</button>
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