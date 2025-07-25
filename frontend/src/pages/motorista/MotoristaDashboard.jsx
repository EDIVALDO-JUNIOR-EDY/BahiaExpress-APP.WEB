// CÓDIGO COMPLETO E REATORADO para frontend/src/pages/motorista/MotoristaDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
// 1. Importa o hook do nosso contexto de mudanças
import { useMudanca } from '../../contexts/MudancaContext';

import AnimatedLogo from '../../components/AnimatedLogo';
import api from '../../services/api'; // Ainda necessário para a função 'handleFinalizar' por enquanto

const MotoristaDashboard = () => {
    const { currentUser } = useAuth();
    // 2. Usa o contexto para obter os dados e a função de busca
    const { mudancas, loading, buscarMinhasMudancas } = useMudanca();

    // 3. O useEffect agora é muito mais simples
    useEffect(() => {
        if (currentUser) {
            buscarMinhasMudancas('motorista');
        }
    }, [currentUser]);

    // A função de finalizar ainda pode ser mantida localmente por enquanto,
    // ou movida para o contexto em um próximo passo
    const handleFinalizar = async (freteId) => {
        if (!window.confirm("Você confirma que este serviço foi concluído?")) return;
        try {
            await api.post(`/mudancas/finalizar/${freteId}`);
            alert('Serviço marcado como finalizado!');
            buscarMinhasMudancas('motorista'); // Re-busca os dados para atualizar a lista
        } catch (error) {
            alert('Não foi possível finalizar o serviço.');
        }
    };

    // Usa 'loading' que vem direto do contexto
    if (loading) return <p className="p-8 text-center text-lg">Carregando seus fretes...</p>;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <AnimatedLogo size="80px" />
                <h1 className="text-3xl font-bold text-gray-800">Meus Fretes Aceitos</h1>
            </div>

            {/* A lógica de exibição agora usa a variável 'mudancas' do contexto */}
            {mudancas.length === 0 ? (
                <div className="text-center bg-white p-8 rounded-lg shadow">
                    <p className="text-gray-600 text-lg">Você ainda não aceitou nenhum frete.</p>
                    <Link to="/motorista/buscar-fretes" className="mt-4 inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                        Encontrar Novos Fretes
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {mudancas.map(f => (
                        <div key={f.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500 transition-shadow hover:shadow-lg">
                            <p>De: <span className="font-semibold">{f.origem.cidade}</span></p>
                            <p>Para: <span className="font-semibold">{f.destino.cidade}</span></p>
                            <p className="mt-2">Status: <span className="font-bold text-blue-600 capitalize">{f.status.replace(/_/g, ' ')}</span></p>
                            
                            <div className="mt-4 pt-4 border-t flex items-center flex-wrap gap-4">
                                {f.status === 'aguardando_assinatura_contrato' && (
                                    <Link to={`/contrato/${f.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-semibold transition-colors">Assinar Contrato</Link>
                                )}
                                {f.status !== 'finalizada' && (
                                    <>
                                        <button onClick={() => handleFinalizar(f.id)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 font-semibold transition-colors">Finalizar Serviço</button>
                                        <Link to={`/chat/${f.id}`} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-semibold transition-colors">
                                            Conversar com Cliente
                                        </Link>
                                    </>
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