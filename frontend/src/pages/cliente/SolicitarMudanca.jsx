// CÓDIGO COMPLETO E REATORADO para frontend/src/pages/cliente/SolicitarMudanca.jsx

import React, { useState } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// 1. Importa o hook do nosso novo contexto
import { useMudanca } from '../../contexts/MudancaContext';

// Componente auxiliar (sem alterações)
const CheckboxServico = ({ id, label, Icon, checked, onChange }) => (
    <div className="flex items-center">
        <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor={id} className="ml-3 flex items-center text-md text-gray-700">
            <Icon className="mr-2 text-blue-500" />
            {label}
        </label>
    </div>
);

const SolicitarMudanca = () => {
    const navigate = useNavigate();
    // 2. Usa o contexto para obter a função e os estados de loading/error
    const { solicitarNovaMudanca, loading, error } = useMudanca();

    // O estado do formulário continua sendo local do componente, o que é correto.
    const [formData, setFormData] = useState({
        origem: '',
        destino: '',
        itens: '',
        solicitaEmpacotamento: false,
        transportePet: false,
        transporteVeiculo: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // 3. A função handleSubmit agora é muito mais simples
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const dadosParaEnviar = {
            ...formData,
            itens: formData.itens.split(',').map(item => item.trim()),
        };

        // Chama a função centralizada do contexto
        const { success } = await solicitarNovaMudanca(dadosParaEnviar);

        if (success) {
            alert("Solicitação de mudança enviada com sucesso!");
            navigate('/cliente/dashboard');
        }
        // O tratamento de erro e loading já é feito pelo contexto e exibido no return
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Solicitar Minha Mudança</h1>
            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
                {/* Seção de Endereços (sem alterações) */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Endereços</h2>
                    <div className="mb-4">
                        <label className="font-semibold text-gray-700 block mb-2" htmlFor="origem">Endereço de Origem:</label>
                        <input type="text" id="origem" name="origem" value={formData.origem} onChange={handleChange} placeholder="Rua, Número, Bairro, Cidade - Estado" className="w-full p-3 border rounded-lg" required/>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700 block mb-2" htmlFor="destino">Endereço de Destino:</label>
                        <input type="text" id="destino" name="destino" value={formData.destino} onChange={handleChange} placeholder="Rua, Número, Bairro, Cidade - Estado" className="w-full p-3 border rounded-lg" required/>
                    </div>
                </div>

                {/* Seção de Itens e Serviços (sem alterações) */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Detalhes da Mudança</h2>
                    <div className="mb-4">
                        <label className="font-semibold text-gray-700 block mb-2" htmlFor="itens">Principais Itens (separados por vírgula):</label>
                        <textarea id="itens" name="itens" value={formData.itens} onChange={handleChange} placeholder="Ex: Geladeira, Fogão, Cama de casal, 10 caixas" rows="3" className="w-full p-3 border rounded-lg"></textarea>
                    </div>
                    <div className="space-y-4">
                        <CheckboxServico id="solicitaEmpacotamento" label="Preciso do serviço de empacotamento" Icon={FaBoxOpen} checked={formData.solicitaEmpacotamento} onChange={handleChange} />
                        <CheckboxServico id="transportePet" label="Preciso transportar um Pet" Icon={FaPaw} checked={formData.transportePet} onChange={handleChange} />
                        <CheckboxServico id="transporteVeiculo" label="Preciso transportar um Veículo (moto/carro)" Icon={FaMotorcycle} checked={formData.transporteVeiculo} onChange={handleChange} />
                    </div>
                </div>
                
                {/* 4. Exibe o erro que vem do contexto */}
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-lg">{error}</p>}

                <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center hover:bg-green-700 disabled:bg-gray-400">
                    <FaPaperPlane className="mr-3" />
                    {/* Usa o 'loading' que vem do contexto */}
                    {loading ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
            </form>
        </div>
    );
};

export default SolicitarMudanca;