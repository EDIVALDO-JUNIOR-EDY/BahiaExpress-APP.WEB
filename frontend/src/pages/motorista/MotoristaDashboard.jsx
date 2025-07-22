import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api'; // <-- MUDANÇA AQUI
import { Link } from 'react-router-dom';

const MotoristaDashboard = () => {
    const { currentUser } = useAuth();
    const [fretes, setFretes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMeusFretes = async () => {
        if (!currentUser) return;
        try {
            setLoading(true);
            // MUDANÇA AQUI:
            const response = await api.get(`/mudancas/minhas-mudancas/motorista/${currentUser.uid}`);
            setFretes(response.data);
        } catch (error) {
            console.error("Erro ao buscar meus fretes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeusFretes();
    }, [currentUser]);

    const handleFinalizar = async (freteId) => {
        if (!window.confirm("Você confirma que este serviço foi concluído?")) return;
        try {
            // MUDANÇA AQUI:
            await api.post(`/mudancas/finalizar/${freteId}`);
            alert('Serviço marcado como finalizado!');
            fetchMeusFretes();
        } catch (error) {
            console.error("Erro ao finalizar serviço:", error);
            alert('Não foi possível finalizar o serviço.');
        }
    };

    if (loading) return <p className="p-8 text-center">Carregando seus fretes...</p>;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Meus Fretes Aceitos</h1>
            {fretes.length === 0 ? ( <p>Você ainda não aceitou nenhum frete.</p> ) : (
                <div className="space-y-4">
                    {fretes.map(f => (
                        <div key={f.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
                            <p>De: <span className="font-semibold">{f.origem}</span> Para: <span className="font-semibold">{f.destino}</span></p>
                            <p>Status: <span className="font-bold text-blue-600">{f.status.replace(/_/g, ' ')}</span></p>
                            <div className="mt-4 pt-4 border-t flex items-center flex-wrap gap-4">
                                {f.status === 'aguardando_assinatura_contrato' && (
                                    <Link to={`/contrato/${f.id}`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Assinar Contrato</Link>
                                )}
                                {f.status !== 'finalizada' && (
                                    <button onClick={() => handleFinalizar(f.id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Finalizar Serviço</button>
                                )}
                                {f.status !== 'finalizada' && (
                                    <Link to={`/chat/${f.id}`} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                                        Conversar com Cliente
                                    </Link>
                                )}
                                {f.status === 'finalizada' && (
                                    <p className="text-green-700 font-semibold">Serviço Concluído!</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default MotoristaDashboard;