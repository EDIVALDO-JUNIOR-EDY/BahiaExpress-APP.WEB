import React, { useState } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaPaperPlane, FaRoute } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api'; // <-- MUDANÇA AQUI
import { useNavigate } from 'react-router-dom';

const ServiceButton = ({ title, description, icon, isSelected, onToggle }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-all ${isSelected ? 'bg-green-100 border-green-400' : 'bg-gray-100 border-gray-200'} border`}>
        <div><h3 className="font-bold text-lg flex items-center">{icon}{title}</h3><p className="text-sm text-gray-600">{description}</p></div>
        <button type="button" onClick={onToggle} className={`px-6 py-2 rounded-full font-semibold text-white ${isSelected ? 'bg-red-500' : 'bg-blue-500'}`}>{isSelected ? 'Remover' : 'Adicionar'}</button>
    </div>
);
const OrangeServiceButton = ({ title, icon, isSelected, onToggle }) => (
    <div className="flex flex-col p-4 bg-white rounded-lg border-2 border-orange-200">
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center">{icon}{title}</h3>
            <button type="button" onClick={onToggle} className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold">{isSelected ? 'Remover' : 'Contratar'}</button>
        </div>
        {isSelected && (
            <div className="mt-4 pt-4 border-t border-orange-200">
                <p className="text-xs text-red-600 font-semibold">AVISO: O valor deste serviço será combinado diretamente com o motorista.</p>
            </div>
        )}
    </div>
);

const SolicitarMudanca = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [solicitaEmpacotamento, setSolicitaEmpacotamento] = useState(false);
    const [transportePet, setTransportePet] = useState(false);
    const [transporteVeiculo, setTransporteVeiculo] = useState(false);
    const [distanciaAcima30km, setDistanciaAcima30km] = useState(false);
    const [valorPropostoCliente, setValorPropostoCliente] = useState('');
    const [origem, setOrigem] = useState('');
    const [destino, setDestino] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!origem || !destino) {
            alert("Por favor, preencha os endereços de origem e destino.");
            return;
        }
        const dadosMudanca = {
            clienteId: currentUser.uid,
            origem,
            destino,
            itens: [],
            solicitaEmpacotamento,
            transportePet,
            transporteVeiculo,
            distanciaAcima30km,
            valorPropostoCliente: distanciaAcima30km ? valorPropostoCliente : null,
        };
        try {
            // MUDANÇA AQUI:
            await api.post('/mudancas/criar', dadosMudanca);
            alert("Solicitação de mudança enviada com sucesso! Você será notificado quando um motorista aceitar.");
            navigate('/');
        } catch (error) {
            console.error("Erro ao enviar solicitação:", error);
            alert("Houve um erro ao enviar sua solicitação. Tente novamente.");
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Solicitar Minha Mudança</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Endereços</h2>
                    <div className="mb-4">
                        <label className="font-semibold block mb-2">Endereço de Origem:</label>
                        <input type="text" value={origem} onChange={(e) => setOrigem(e.target.value)} placeholder="Rua, Número, Bairro, Cidade - Estado" className="w-full p-2 border rounded" required/>
                    </div>
                    <div>
                        <label className="font-semibold block mb-2">Endereço de Destino:</label>
                        <input type="text" value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Rua, Número, Bairro, Cidade - Estado" className="w-full p-2 border rounded" required/>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Valor e Negociação</h2>
                    <ServiceButton title="A distância é maior que 30km?" description="Habilita a negociação de valores para longas distâncias." icon={<FaRoute className="mr-2 text-blue-500"/>} isSelected={distanciaAcima30km} onToggle={() => setDistanciaAcima30km(p => !p)}/>
                    {distanciaAcima30km && (<div className="mt-4 pt-4 border-t"><label className="font-semibold">Sua proposta inicial (R$):</label><input type="number" value={valorPropostoCliente} onChange={(e) => setValorPropostoCliente(e.target.value)} placeholder="Ex: 500" className="w-full p-2 border rounded mt-2"/><p className="text-xs text-gray-500 mt-1">O motorista poderá fazer uma contraproposta.</p></div>)}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Serviços Adicionais</h2>
                    <div className="space-y-6">
                        <ServiceButton title="Serviço de Empacotamento" description="Nossos parceiros cuidam da embalagem de tudo." icon={<FaBoxOpen className="mr-2 text-blue-500"/>} isSelected={solicitaEmpacotamento} onToggle={() => setSolicitaEmpacotamento(p => !p)}/>
                        <OrangeServiceButton title="Transporte de Pets" icon={<FaPaw className="mr-2 text-orange-500"/>} isSelected={transportePet} onToggle={() => setTransportePet(p => !p)} />
                        <OrangeServiceButton title="Transporte de Veículos" icon={<FaMotorcycle className="mr-2 text-orange-500"/>} isSelected={transporteVeiculo} onToggle={() => setTransporteVeiculo(p => !p)} />
                    </div>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center hover:bg-green-700"><FaPaperPlane className="mr-3" />Enviar Solicitação</button>
            </form>
        </div>
    );
};
export default SolicitarMudanca;