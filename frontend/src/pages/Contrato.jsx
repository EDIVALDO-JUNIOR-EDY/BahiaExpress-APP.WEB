import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaFileSignature, FaSpinner } from 'react-icons/fa';

const Contrato = () => {
    const { mudancaId } = useParams();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    // No futuro, este estado viria do banco de dados
    const [assinaturas, setAssinaturas] = useState({ cliente: false, motorista: false });
    const [pdfUrl, setPdfUrl] = useState('');

    useEffect(() => {
        // Atualiza a URL do PDF sempre que as assinaturas mudam
        const url = `http://localhost:5000/api/contrato/gerar/${mudancaId}?clienteAssinou=${assinaturas.cliente}&motoristaAssinou=${assinaturas.motorista}`;
        setPdfUrl(url);
    }, [mudancaId, assinaturas]);

    const handleSign = () => {
        setLoading(true);
        // Simulação de uma chamada de API para assinar o contrato
        setTimeout(() => { 
            if (currentUser?.userType) {
                setAssinaturas(prev => ({ ...prev, [currentUser.userType]: true }));
                alert('Contrato assinado com sucesso!');
            }
            setLoading(false);
        }, 1000);
    };

    const hasSigned = currentUser && assinaturas[currentUser.userType];

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-4">Contrato de Serviço</h1>
            <p className="mb-6 text-gray-600">ID da Mudança: {mudancaId}</p>
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
                            disabled={loading || !currentUser} 
                            className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg flex items-center justify-center mx-auto disabled:bg-gray-400 hover:bg-green-700"
                        >
                            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaFileSignature className="mr-2" />}
                            Assinar Contrato
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contrato;