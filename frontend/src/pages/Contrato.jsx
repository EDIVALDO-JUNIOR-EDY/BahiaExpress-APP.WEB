// CÓDIGO COMPLETO E CORRIGIDO para frontend/src/pages/Contrato.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; // Usaremos para buscar os dados da mudança
import { FaFileSignature, FaSpinner, FaPaw, FaMotorcycle, FaBoxOpen } from 'react-icons/fa';

// Componente para exibir os detalhes dos serviços (pets, veículos, etc.)
const DetalheServico = ({ Icon, label, incluido }) => (
    <div className="flex items-center text-md">
        <Icon className={`mr-2 ${incluido ? 'text-green-600' : 'text-gray-400'}`} />
        <span className={`${incluido ? 'text-gray-800' : 'text-gray-400'}`}>
            {label}: {incluido ? 'Sim' : 'Não'}
        </span>
    </div>
);

const Contrato = () => {
    const { mudancaId } = useParams();
    const { currentUser } = useAuth();
    
    // Estados para os dados da mudança
    const [mudanca, setMudanca] = useState(null);
    const [loadingDados, setLoadingDados] = useState(true);
    const [error, setError] = useState('');

    // Estados para a LÓGICA DE ASSINATURA (mantidos do seu código original)
    const [loadingAssinatura, setLoadingAssinatura] = useState(false);
    const [assinaturas, setAssinaturas] = useState({ cliente: false, motorista: false });
    const [pdfUrl, setPdfUrl] = useState('');

    // Efeito para buscar os dados da mudança do backend
    useEffect(() => {
        const fetchMudanca = async () => {
            try {
                const response = await api.get(`/mudancas/${mudancaId}`);
                setMudanca(response.data);
                // Aqui, no futuro, buscaremos o status da assinatura do banco de dados
                // Por enquanto, mantemos o estado local
            } catch (err) {
                setError('Não foi possível carregar os detalhes do contrato.');
            } finally {
                setLoadingDados(false);
            }
        };
        fetchMudanca();
    }, [mudancaId]);

    // Efeito para ATUALIZAR a URL do PDF (mantido do seu código original)
    useEffect(() => {
        const url = `http://localhost:5000/api/contrato/gerar/${mudancaId}?clienteAssinou=${assinaturas.cliente}&motoristaAssinou=${assinaturas.motorista}`;
        setPdfUrl(url);
    }, [mudancaId, assinaturas]);

    // Função de assinatura (mantida do seu código original)
    const handleSign = () => {
        setLoadingAssinatura(true);
        // Simulação de uma chamada de API para assinar
        setTimeout(() => { 
            // A lógica original foi melhorada para usar o userType do currentUser
            const userType = currentUser?.userType;
            if (userType === 'cliente' || userType === 'motorista') {
                setAssinaturas(prev => ({ ...prev, [userType]: true }));
                alert('Contrato assinado com sucesso!');
            } else {
                alert('Tipo de usuário desconhecido, não foi possível assinar.');
            }
            setLoadingAssinatura(false);
        }, 1000);
    };

    const hasSigned = currentUser && assinaturas[currentUser.userType];

    if (loadingDados) return <div className="p-8 text-center">Carregando detalhes do contrato...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!mudanca) return <div className="p-8 text-center">Contrato não encontrado.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-4">Contrato de Serviço</h1>
            <p className="mb-6 text-gray-600">ID da Mudança: {mudancaId}</p>

            {/* Nova Seção de Detalhes da Mudança */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">Resumo do Serviço</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <p><strong>Cliente:</strong> {mudanca.clienteNome}</p>
                    <p><strong>Motorista:</strong> {mudanca.motoristaNome || 'Aguardando'}</p>
                    <p><strong>Origem:</strong> {mudanca.origem.cidade}</p>
                    <p><strong>Destino:</strong> {mudanca.destino.cidade}</p>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <h3 className="font-bold text-lg mb-3">Serviços Inclusos</h3>
                    <div className="space-y-2">
                        <DetalheServico Icon={FaBoxOpen} label="Empacotamento" incluido={mudanca.solicitaEmpacotamento} />
                        <DetalheServico Icon={FaPaw} label="Transporte de Pet" incluido={mudanca.transportePet} />
                        <DetalheServico Icon={FaMotorcycle} label="Transporte de Veículo" incluido={mudanca.transporteVeiculo} />
                    </div>
                </div>
            </div>

            {/* Seção do PDF e Assinatura (lógica original mantida) */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="w-full h-[600px] border rounded-lg mb-8">
                    {pdfUrl && <iframe src={pdfUrl} width="100%" height="100%" title={`Contrato ${mudancaId}`}></iframe>}
                </div>
                <div className="text-center">
                    {hasSigned ? (
                        <p className="text-green-600 font-bold text-lg">Você já assinou este contrato.</p>
                    ) : (
                        <button 
                            onClick={handleSign} 
                            disabled={loadingAssinatura || !currentUser} 
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center justify-center mx-auto disabled:bg-gray-400 hover:bg-green-700"
                        >
                            {loadingAssinatura ? <FaSpinner className="animate-spin mr-2" /> : <FaFileSignature className="mr-2" />}
                            Assinar Contrato
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contrato;