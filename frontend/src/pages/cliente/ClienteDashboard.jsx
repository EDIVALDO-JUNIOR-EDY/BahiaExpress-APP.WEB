// CÓDIGO COMPLETO E REATORADO para frontend/src/pages/cliente/ClienteDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
// 1. Importa o hook do nosso contexto de mudanças
import { useMudanca } from '../../contexts/MudancaContext';

import AvaliacaoModal from '../../components/AvaliacaoModal';
import AnimatedLogo from '../../components/AnimatedLogo';

const ClienteDashboard = () => {
    const { currentUser } = useAuth();
    // 2. Usa o contexto para obter os dados e a função de busca
    const { mudancas, loading, buscarMinhasMudancas } = useMudanca();
    
    // Os estados do modal continuam sendo locais, pois são específicos deste componente
    const [showModal, setShowModal] = useState(false);
    const [mudancaParaAvaliar, setMudancaParaAvaliar] = useState(null);

    // 3. O useEffect agora é muito mais simples
    useEffect(() => {
        // Apenas chama a função do contexto quando o usuário estiver disponível
        if (currentUser) {
            buscarMinhasMudancas('cliente'); // Passa o tipo de usuário para a função do contexto
        }
    }, [currentUser]); // A dependência [currentUser] garante que a busca seja refeita se o usuário mudar

    // A lógica do modal permanece a mesma
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
        if (currentUser) {
          buscarMinhasMudancas('cliente'); // Rebusca os dados para atualizar a lista após avaliar
        }
    };

    // 4. Usa o 'loading' que vem direto do contexto
    if (loading) return <p className="p-8 text-center text-lg">Carregando seu painel...</p>;

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
                <div className="flex items-center gap-4 mb-8">
                    <AnimatedLogo size="80px" />
                    <h1 className="text-3xl font-bold text-gray-800">Meu Painel de Mudanças</h1>
                </div>

                {/* A lógica de exibição agora usa a variável 'mudancas' do contexto */}
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
                                <p>De: <span className="font-semibold">{m.origem.cidade}</span></p>
                                <p>Para: <span className="font-semibold">{m.destino.cidade}</span></p>
                                <p className="mt-2">Status: <span className="font-bold text-blue-600 capitalize">{m.status.replace(/_/g, ' ')}</span></p>
                                
                                <div className="mt-4 pt-4 border-t flex items-center flex-wrap gap-4">
                                    {m.status === 'aguardando_assinatura_contrato' && (
                                        <Link to={`/contrato/${m.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-semibold transition-colors">Assinar Contrato</Link>
                                    )}
                                    {m.status !== 'disponivel' && m.status !== 'finalizada' && !m.avaliada && (
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