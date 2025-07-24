// CÓDIGO COMPLETO E CORRIGIDO para frontend/src/pages/motorista/BuscarFretes.jsx

import React, { useEffect, useState } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // Importação que provavelmente está faltando

// Componente auxiliar que provavelmente está faltando no seu arquivo
const IconeDetalhe = ({ Icon, text, disponivel }) => {
    if (!disponivel) return null;
    return (
        <span className="flex items-center text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            <Icon className="mr-2" />
            {text}
        </span>
    );
};

const BuscarFretes = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [mudancas, setMudancas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMudancas = async () => {
            try {
                setLoading(true);
                const response = await api.get('/mudancas/disponiveis');
                setMudancas(response.data);
            } catch (err) {
                setError("Não foi possível carregar os fretes. Tente recarregar a página.");
            } finally {
                setLoading(false);
            }
        };
        fetchMudancas();
    }, []);

    const handleAceitarFrete = async (mudancaId) => {
        if (!currentUser) {
            alert("Você precisa estar logado para aceitar um frete.");
            return;
        }
        
        const confirmar = window.confirm("Você tem certeza que deseja aceitar este frete?");
        if (!confirmar) return;

        try {
            await api.post(`/mudancas/${mudancaId}/aceitar`);
            alert("Frete aceito! Verifique seu painel para mais detalhes.");
            setMudancas(prev => prev.filter(m => m.id !== mudancaId));
            navigate('/motorista/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || "Não foi possível aceitar este frete.");
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando fretes disponíveis...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Fretes Disponíveis</h1>
            {mudancas.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-semibold text-gray-700">Nenhum frete disponível no momento.</h2>
                    <p className="text-gray-500 mt-2">Volte mais tarde para verificar novas oportunidades!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {mudancas.map(m => (
                        <div key={m.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
                            <div className="flex flex-col md:flex-row justify-between md:items-start">
                                <div>
                                    <div className="flex items-center text-xl font-bold mb-2">
                                        <span>{m.origem.cidade}</span>
                                        <FaMapMarkerAlt className="inline text-gray-400 mx-2"/>
                                        <span>{m.destino.cidade}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">Postado por: {m.clienteNome}</p>
                                </div>
                                <button onClick={() => handleAceitarFrete(m.id)} className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold whitespace-nowrap flex items-center justify-center hover:bg-green-600 w-full md:w-auto">
                                    <FaCheckCircle className="mr-2" />
                                    Aceitar Frete
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t">
                                <span className="font-semibold text-gray-700">Serviços inclusos:</span>
                                <IconeDetalhe Icon={FaBoxOpen} text="Empacotamento" disponivel={m.solicitaEmpacotamento} />
                                <IconeDetalhe Icon={FaPaw} text="Transporte de Pet" disponivel={m.transportePet} />
                                <IconeDetalhe Icon={FaMotorcycle} text="Transporte de Veículo" disponivel={m.transporteVeiculo} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuscarFretes;