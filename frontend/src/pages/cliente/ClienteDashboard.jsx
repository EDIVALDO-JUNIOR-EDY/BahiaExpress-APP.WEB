// C:/dev/frontend/src/pages/cliente/ClienteDashboard.jsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useMudanca } from '../../contexts/MudancaContext';
import AvaliacaoModal from '../../components/AvaliacaoModal';
import AnimatedLogo from '../../components/shared/AnimatedLogo';

// --- NOVAS IMPORTAÇÕES ---
import FeatureCard from '../../components/shared/FeatureCard';
import { FaDollarSign, FaMapMarkedAlt, FaUserShield, FaHeadset } from 'react-icons/fa';

const ClienteDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { mudancas, loading, buscarMinhasMudancas } = useMudanca();
    const [showModal, setShowModal] = useState(false);
    const [mudancaParaAvaliar, setMudancaParaAvaliar] = useState(null);

    useEffect(() => {
        if (currentUser) {
            buscarMinhasMudancas('cliente');
        }
    }, [currentUser]); // Removido 'buscarMinhasMudancas' das dependências para evitar loops

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
          buscarMinhasMudancas('cliente');
        }
    };

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
            
            <div className="p-4 md:p-8 bg-brand-background min-h-screen">
                <div className="flex items-center gap-4 mb-8">
                    <AnimatedLogo size="80px" />
                    {/* TÍTULO CONDICIONAL: Muda dependendo se o usuário tem mudanças */}
                    <h1 className="text-3xl font-bold text-brand-text-primary">
                      {mudancas.length === 0 ? 'Preciso de uma mudança' : 'Meu Painel de Mudanças'}
                    </h1>
                </div>

                {mudancas.length === 0 ? ( 
                    // --- NOVA UI PARA NOVOS USUÁRIOS ---
                    <div className="bg-brand-surface p-8 rounded-lg shadow-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <FeatureCard Icon={FaDollarSign} title="Compare preços de motoristas" />
                        <FeatureCard Icon={FaMapMarkedAlt} title="Acompanhe em tempo real" />
                        <FeatureCard Icon={FaUserShield} title="Motoristas verificados" />
                        <FeatureCard Icon={FaHeadset} title="Atendimento especializado" />
                      </div>
                      <div className="text-center">
                        <button onClick={() => navigate('/cliente/solicitar-mudanca')} className="bg-brand-yellow text-brand-blue font-bold py-4 px-8 rounded-lg text-xl hover:opacity-90 transition-opacity">
                            Solicitar Minha Primeira Mudança
                        </button>
                      </div>
                    </div>
                ) : (
                    // --- UI EXISTENTE PARA USUÁRIOS COM MUDANÇAS (CÓDIGO ORIGINAL MANTIDO) ---
                    <div className="space-y-4">
                        {mudancas.map(m => (
                            <div key={m.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg">
                                {/* ... seu JSX original para listar mudanças ... */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default ClienteDashboard;