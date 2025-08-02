// C:/dev/frontend/src/pages/cliente/SolicitarMudanca.jsx

import React, { useState } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useMudanca } from '../../contexts/MudancaContext';

// --- COMPONENTES INTERNOS PARA MELHOR ORGANIZAÇÃO ---

const CheckboxServico = ({ id, label, Icon, checked, onChange }) => (
    <div className="flex items-center">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
        <label htmlFor={id} className="ml-3 flex items-center text-md text-gray-700 cursor-pointer">
            <Icon className="mr-2 text-brand-blue" />
            {label}
        </label>
    </div>
);

const CampoEndereco = ({ tipo, dados, onChange }) => (
    <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">{tipo === 'origem' ? 'Endereço de Origem' : 'Endereço de Destino'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="cep" value={dados.cep} onChange={onChange} placeholder="CEP" className="p-2 border rounded-md col-span-2 md:col-span-1" required />
            <input type="text" name="cidade" value={dados.cidade} onChange={onChange} placeholder="Cidade" className="p-2 border rounded-md col-span-2 md:col-span-1" required />
            <input type="text" name="bairro" value={dados.bairro} onChange={onChange} placeholder="Bairro" className="p-2 border rounded-md col-span-2 md:col-span-1" required />
            <input type="text" name="rua" value={dados.rua} onChange={onChange} placeholder="Rua e Número" className="p-2 border rounded-md col-span-2 md:col-span-1" required />
            <textarea name="referencia" value={dados.referencia} onChange={onChange} placeholder="Ponto de referência (opcional)" rows="2" className="p-2 border rounded-md col-span-2"></textarea>
        </div>
    </div>
);


// --- COMPONENTE PRINCIPAL ---

const SolicitarMudanca = () => {
    const navigate = useNavigate();
    const { solicitarNovaMudanca, loading, error } = useMudanca();

    // Novo estado do formulário para refletir a estrutura de dados complexa
    const [formData, setFormData] = useState({
        origem: { cep: '', cidade: '', bairro: '', rua: '', referencia: '' },
        destino: { cep: '', cidade: '', bairro: '', rua: '', referencia: '' },
        comodos: [{ id: 1, nome: 'Sala', itens: [{ id: 1, nome: 'Sofá', qt: 1 }] }], // Exemplo inicial
        servicosAdicionais: {
            empacotamento: false,
            pet: null, // Será um objeto se o serviço for selecionado
            veiculo: null, // Será um objeto se o serviço for selecionado
        }
    });

    const handleEnderecoChange = (tipo, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [tipo]: { ...prev[tipo], [name]: value }
        }));
    };

    const handleServicoChange = (e) => {
        const { id, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            servicosAdicionais: { ...prev.servicosAdicionais, [id]: checked }
        }));
        // TODO: Abrir o Modal correspondente se 'checked' for true
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { success } = await solicitarNovaMudanca(formData);
        if (success) {
            alert("Solicitação enviada com sucesso!");
            navigate('/cliente/dashboard');
        }
    };

    return (
        <div className="p-4 md:p-8 bg-brand-background min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-brand-text-primary">Solicitar Minha Mudança</h1>
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                
                {/* --- SEÇÃO DE ENDEREÇOS REATORADA --- */}
                <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">1. Endereços</h2>
                    <div className="space-y-6">
                        <CampoEndereco tipo="origem" dados={formData.origem} onChange={(e) => handleEnderecoChange('origem', e)} />
                        <hr />
                        <CampoEndereco tipo="destino" dados={formData.destino} onChange={(e) => handleEnderecoChange('destino', e)} />
                    </div>
                </div>

                {/* --- SEÇÃO DE ITENS (A SER IMPLEMENTADA) --- */}
                <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">2. Detalhes da Mudança</h2>
                    <p className="text-gray-500 italic">(Em breve: adicione seus itens por cômodo aqui)</p>
                    {/* Aqui entrará a lógica para adicionar/remover cômodos e itens */}
                </div>
                
                {/* --- SEÇÃO DE SERVIÇOS ADICIONAIS --- */}
                <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">3. Serviços Adicionais</h2>
                     <div className="space-y-4">
                        <CheckboxServico id="empacotamento" label="Preciso do serviço de empacotamento" Icon={FaBoxOpen} checked={formData.servicosAdicionais.empacotamento} onChange={handleServicoChange} />
                        <CheckboxServico id="pet" label="Preciso transportar um Pet" Icon={FaPaw} checked={!!formData.servicosAdicionais.pet} onChange={handleServicoChange} />
                        <CheckboxServico id="veiculo" label="Preciso transportar um Veículo (moto/carro)" Icon={FaMotorcycle} checked={!!formData.servicosAdicionais.veiculo} onChange={handleServicoChange} />
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-lg">{error}</p>}

                <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center hover:bg-green-700 disabled:bg-gray-400">
                    <FaPaperPlane className="mr-3" />
                    {loading ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
            </form>
        </div>
    );
};

export default SolicitarMudanca;