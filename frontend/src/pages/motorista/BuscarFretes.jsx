// CÓDIGO COMPLETO E REATORADO para frontend/src/pages/motorista/BuscarFretes.jsx

import React, { useEffect } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// 1. Importa o hook do nosso contexto de mudanças
import { useMudanca } from '../../contexts/MudancaContext';

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
    const navigate = useNavigate();
    // 2. Usa o contexto para obter os dados e as funções
    const { fretesDisponiveis, loading, error, buscarFretesDisponiveis, aceitarFrete } = useMudanca();

    // 3. O useEffect agora apenas chama a função do contexto
    useEffect(() => {
        buscarFretesDisponiveis();
    }, []); // Executa apenas uma vez quando o componente monta

    // 4. A função de aceite agora é muito mais simples
    const handleAceitarFrete = async (mudancaId) => {
        const confirmar = window.confirm("Você tem certeza que deseja aceitar este frete?");
        if (!confirmar) return;

        const { success, error: acceptError } = await aceitarFrete(mudancaId);

        if (success) {
            alert("Frete aceito! Verifique seu painel para mais detalhes.");
            navigate('/motorista/dashboard');
        } else {
            alert(acceptError || "Não foi possível aceitar este frete.");
        }
    };

    // Usa 'loading' e 'error' que vêm direto do contexto
    if (loading) return <div className="p-8 text-center">Carregando fretes disponíveis...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Fretes Disponíveis</h1>
            {fretesDisponiveis.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-xl font-semibold text-gray-700">Nenhum frete disponível no momento.</h2>
                    <p className="text-gray-500 mt-2">Volte mais tarde para verificar novas oportunidades!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Usa a variável 'fretesDisponiveis' do contexto */}
                    {fretesDisponiveis.map(m => (
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