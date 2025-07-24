// CÓDIGO COMPLETO E ATUALIZADO para frontend/src/pages/cliente/SolicitarMudanca.jsx

import React, { useState } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // Usando a instância do Axios

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
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        origem: '',
        destino: '',
        itens: '', // Campo simples para itens por enquanto
        solicitaEmpacotamento: false,
        transportePet: false,      // NOVO
        transporteVeiculo: false,   // NOVO
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.origem || !formData.destino) {
            setError("Por favor, preencha os endereços de origem e destino.");
            return;
        }
        setLoading(true);
        setError('');

        try {
            // A API já pega o ID do cliente pelo token, não precisamos mais enviar
            const dadosParaEnviar = {
                ...formData,
                itens: formData.itens.split(',').map(item => item.trim()), // Transforma a string de itens em um array
            };

            await api.post('/mudancas/criar', dadosParaEnviar);
            
            alert("Solicitação de mudança enviada com sucesso!");
            navigate('/cliente/dashboard'); // Redireciona para o dashboard do cliente
        } catch (err) {
            setError(err.response?.data?.message || "Houve um erro ao enviar sua solicitação.");
            console.error("Erro ao enviar solicitação:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Solicitar Minha Mudança</h1>
            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
                {/* Seção de Endereços */}
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

                {/* Seção de Itens e Serviços */}
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