// C:/dev/frontend/src/pages/cliente/ClienteDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useMudanca } from '../../contexts/MudancaContext';
import AvaliacaoModal from '../../components/AvaliacaoModal';
import AnimatedLogo from '../../components/shared/AnimatedLogo';
import FeatureCard from '../../components/shared/FeatureCard';
import { FaDollarSign, FaMapMarkedAlt, FaUserShield, FaHeadset, FaEye, FaStar, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

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
        if (currentUser) {
          buscarMinhasMudancas('cliente');
        }
    };
    
    // Função para obter ícone e cor baseado no status
    const getStatusInfo = (status) => {
        switch (status) {
            case 'disponivel':
                return { icon: FaClock, color: 'text-yellow-500', text: 'Disponível' };
            case 'aceita':
                return { icon: FaCheckCircle, color: 'text-green-500', text: 'Aceita' };
            case 'em_andamento':
                return { icon: FaEye, color: 'text-blue-500', text: 'Em Andamento' };
            case 'concluida':
                return { icon: FaStar, color: 'text-purple-500', text: 'Concluída' };
            case 'cancelada':
                return { icon: FaTimesCircle, color: 'text-red-500', text: 'Cancelada' };
            default:
                return { icon: FaClock, color: 'text-gray-500', text: status };
        }
    };
    
    // Função para obter ações baseadas no status
    const getActions = (mudanca) => {
        const actions = [];
        
        if (mudanca.status === 'disponivel') {
            actions.push(
                <button 
                    key="cancelar"
                    onClick={() => {/* Implementar cancelamento */}}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                    Cancelar
                </button>
            );
        }
        
        if (mudanca.status === 'aceita' || mudanca.status === 'em_andamento') {
            actions.push(
                <Link 
                    key="contrato"
                    to={`/contrato/${mudanca.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Ver Contrato
                </Link>
            );
            
            actions.push(
                <Link 
                    key="chat"
                    to={`/chat/${mudanca.id}`}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                    Chat
                </Link>
            );
        }
        
        if (mudanca.status === 'concluida' && !mudanca.avaliacao) {
            actions.push(
                <button 
                    key="avaliar"
                    onClick={() => handleOpenModal(mudanca)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                    Avaliar
                </button>
            );
        }
        
        return actions;
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
            
            <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-500 to-blue-600">
                <div className="flex items-center gap-4 mb-8">
                    <AnimatedLogo size="80px" />
                    <h1 className="text-3xl font-bold text-white">
                        {mudancas.length === 0 ? 'Preciso de uma mudança' : 'Meu Painel de Mudanças'}
                    </h1>
                </div>
                
                {mudancas.length === 0 ? ( 
                    // UI para novos usuários
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <FeatureCard Icon={FaDollarSign} title="Compare preços de motoristas" />
                        <FeatureCard Icon={FaMapMarkedAlt} title="Acompanhe em tempo real" />
                        <FeatureCard Icon={FaUserShield} title="Motoristas verificados" />
                        <FeatureCard Icon={FaHeadset} title="Atendimento especializado" />
                      </div>
                      <div className="text-center">
                        <button onClick={() => navigate('/cliente/solicitar-mudanca')} className="bg-orange-500 text-white font-bold py-4 px-8 rounded-lg text-xl hover:bg-orange-600 transition-colors">
                            Solicitar Minha Primeira Mudança
                        </button>
                      </div>
                    </div>
                ) : (
                    // UI para usuários com mudanças
                    <div className="space-y-4">
                        {mudancas.map(m => {
                            const statusInfo = getStatusInfo(m.status);
                            const StatusIcon = statusInfo.icon;
                            const actions = getActions(m);
                            
                            return (
                                <div key={m.id} className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <StatusIcon className={statusInfo.color} />
                                                <span className={`font-medium ${statusInfo.color}`}>
                                                    {statusInfo.text}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    • {new Date(m.createdAt?.toDate?.() || m.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="font-medium">Origem:</span> {m.origem?.cidade}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Destino:</span> {m.destino?.cidade}
                                                </div>
                                                {m.motoristaNome && (
                                                    <div>
                                                        <span className="font-medium">Motorista:</span> {m.motoristaNome}
                                                    </div>
                                                )}
                                                {m.servicosAdicionais?.empacotamento && (
                                                    <div>
                                                        <span className="font-medium">Serviços:</span> Empacotamento
                                                        {m.servicosAdicionais?.pet && ', Pet'}
                                                        {m.servicosAdicionais?.veiculo && ', Veículo'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3 mt-3 md:mt-0">
                                            {actions}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        <div className="text-center mt-8">
                            <button onClick={() => navigate('/cliente/solicitar-mudanca')} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                                Solicitar Nova Mudança
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ClienteDashboard;