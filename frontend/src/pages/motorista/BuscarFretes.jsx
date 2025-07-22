import React, { useEffect, useState } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaMapMarkerAlt, FaRoute, FaCheckCircle } from 'react-icons/fa';
import NotificationIcon from '../../components/NotificationIcon';
import api from '../../services/api'; // <-- MUDANÇA AQUI
import { useAuth } from '../../contexts/AuthContext';

const BuscarFretes = () => {
    const { currentUser } = useAuth();
    const [mudancas, setMudancas] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMudancas = async () => {
        try {
            setLoading(true);
            // MUDANÇA AQUI:
            const response = await api.get('/mudancas/disponiveis');
            setMudancas(response.data);
        } catch (error) {
            console.error("Erro ao buscar fretes:", error);
            alert("Não foi possível carregar os fretes. Tente recarregar a página.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMudancas();
    }, []);

    const handleAceitarFrete = async (mudancaId) => {
        const confirmar = window.confirm("Você tem certeza que deseja aceitar este frete? Esta ação não pode ser desfeita.");
        if (!confirmar) return;

        try {
            // MUDANÇA AQUI:
            await api.post(`/mudancas/aceitar/${mudancaId}`, {
                motoristaId: currentUser.uid
            });
            alert("Frete aceito! Verifique seu painel para assinar o contrato.");
            fetchMudancas(); 
        } catch (error) {
            console.error("Erro ao aceitar frete:", error);
            alert(error.response?.data?.message || "Não foi possível aceitar este frete.");
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando fretes disponíveis...</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Fretes Disponíveis</h1>
            {mudancas.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-semibold text-gray-700">Nenhum frete disponível no momento.</h2>
                    <p className="text-gray-500 mt-2">Volte mais tarde para verificar novas oportunidades!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {mudancas.map(m => (
                        <div key={m.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
                            <div className="flex flex-col md:flex-row justify-between md:items-center">
                                <h2 className="text-xl font-bold mb-2 md:mb-0">{m.origem} <FaMapMarkerAlt className="inline text-gray-400 mx-2"/> {m.destino}</h2>
                                <button onClick={() => handleAceitarFrete(m.id)} className="bg-green-500 text-white px-4 py-2 rounded font-semibold whitespace-nowrap flex items-center justify-center hover:bg-green-600">
                                    <FaCheckCircle className="mr-2" />
                                    Aceitar Frete
                                </button>
                            </div>
                            <div className="mt-2"><p className="text-sm text-gray-600">Proposta do cliente: <span className="font-bold text-green-600">{m.valorPropostoCliente ? `R$ ${m.valorPropostoCliente}` : 'A combinar'}</span></p></div>
                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                                {m.solicitaEmpacotamento && <NotificationIcon Icon={FaBoxOpen} text="Empacotamento"/>}
                                {m.transportePet && <NotificationIcon Icon={FaPaw} text="Transporte de Pet"/>}
                                {m.transporteVeiculo && <NotificationIcon Icon={FaMotorcycle} text="Transporte de Veículo"/>}
                                {m.distanciaAcima30km && <NotificationIcon Icon={FaRoute} text="Longa Distância"/>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default BuscarFretes;