import React, { useState } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaPaperPlane, FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useMudanca } from '../../contexts/MudancaContext';
import axios from 'axios';
import PetFormModal from '../../components/shared/PetFormModal';
import VeiculoFormModal from '../../components/shared/VeiculoFormModal';

// --- COMPONENTES INTERNOS ---
const CheckboxServico = ({ id, name, label, Icon, checked, onChange }) => (
    <div className="flex items-center">
        <input 
            id={id} 
            name={name} 
            type="checkbox" 
            checked={checked} 
            onChange={onChange} 
            className="h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" 
            aria-checked={checked}
        />
        <label 
            htmlFor={id} 
            className="ml-3 flex items-center text-md text-gray-700 cursor-pointer"
        >
            <Icon className="mr-2 text-brand-blue" aria-hidden="true" />
            <span>{label}</span>
        </label>
    </div>
);

const CampoEndereco = ({ tipo, dados, onChange, onCepBlur }) => (
    <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">
            {tipo === 'origem' ? 'Endereço de Origem' : 'Endereço de Destino'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
                type="text" 
                name="cep" 
                value={dados.cep} 
                onChange={onChange} 
                onBlur={onCepBlur} 
                placeholder="CEP (somente números)" 
                className="p-2 border rounded-md md:col-span-1" 
                required 
                aria-label="CEP"
            />
            <input 
                type="text" 
                name="cidade" 
                value={dados.cidade} 
                onChange={onChange} 
                placeholder="Cidade - UF" 
                className="p-2 border rounded-md md:col-span-3 bg-gray-100" 
                readOnly 
                aria-label="Cidade e UF"
            />
            <input 
                type="text" 
                name="bairro" 
                value={dados.bairro} 
                onChange={onChange} 
                placeholder="Bairro" 
                className="p-2 border rounded-md md:col-span-2 bg-gray-100" 
                readOnly 
                aria-label="Bairro"
            />
            <input 
                type="text" 
                name="rua" 
                value={dados.rua} 
                onChange={onChange} 
                placeholder="Rua" 
                className="p-2 border rounded-md md:col-span-2 bg-gray-100" 
                readOnly 
                aria-label="Rua"
            />
            <input 
                type="text" 
                name="numero" 
                value={dados.numero} 
                onChange={onChange} 
                placeholder="Número" 
                className="p-2 border rounded-md md:col-span-2" 
                required 
                aria-label="Número"
            />
            <textarea 
                name="referencia" 
                value={dados.referencia} 
                onChange={onChange} 
                placeholder="Complemento / Ponto de referência (opcional)" 
                rows="2" 
                className="p-2 border rounded-md col-span-4"
                aria-label="Complemento ou ponto de referência"
            ></textarea>
        </div>
    </div>
);

const InventarioComodo = ({ comodo, onComodoChange, onRemoveComodo, onAddItem, onRemoveItem, onItemChange }) => (
    <div className="border p-4 rounded-md space-y-3 bg-gray-50">
        <div className="flex justify-between items-center">
            <input 
                type="text" 
                value={comodo.nome} 
                onChange={(e) => onComodoChange(comodo.id, e.target.value)} 
                className="font-semibold text-lg border-b-2 border-transparent focus:border-brand-blue focus:outline-none bg-transparent w-full"
                placeholder="Nome do cômodo"
                aria-label="Nome do cômodo"
            />
            {onRemoveComodo && (
                <button 
                    type="button" 
                    onClick={() => onRemoveComodo(comodo.id)} 
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label="Remover cômodo"
                >
                    <FaTrash />
                </button>
            )}
        </div>
        {comodo.itens.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
                <input 
                    type="text" 
                    value={item.nome} 
                    onChange={(e) => onItemChange(comodo.id, item.id, 'nome', e.target.value)} 
                    placeholder={`Item ${index + 1}`} 
                    className="flex-grow p-2 border rounded-md"
                    aria-label={`Nome do item ${index + 1}`}
                    required
                />
                <input 
                    type="number" 
                    value={item.qt} 
                    onChange={(e) => onItemChange(comodo.id, item.id, 'qt', e.target.value)} 
                    placeholder="Qt" 
                    min="1" 
                    className="w-20 p-2 border rounded-md"
                    aria-label="Quantidade"
                    required
                />
                <button 
                    type="button" 
                    onClick={() => onRemoveItem(comodo.id, item.id)} 
                    className="text-gray-400 hover:text-red-600 p-1"
                    aria-label="Remover item"
                >
                    <FaTrash />
                </button>
            </div>
        ))}
        <button 
            type="button" 
            onClick={() => onAddItem(comodo.id)} 
            className="text-brand-blue font-semibold text-sm flex items-center"
        >
            <FaPlus className="mr-1" aria-hidden="true" /> Adicionar Item
        </button>
    </div>
);

// --- COMPONENTE PRINCIPAL ---
const SolicitarMudanca = () => {
    const navigate = useNavigate();
    const { solicitarNovaMudanca, loading, error } = useMudanca();
    const [formData, setFormData] = useState({
        origem: { cep: '', cidade: '', bairro: '', rua: '', numero: '', referencia: '' },
        destino: { cep: '', cidade: '', bairro: '', rua: '', numero: '', referencia: '' },
        comodos: [ { id: Date.now(), nome: 'Sala', itens: [{ id: Date.now() + 1, nome: '', qt: 1 }] } ],
        servicosAdicionais: { empacotamento: false, pet: null, veiculo: null }
    });
    
    // Estados para controlar os modais
    const [isPetModalOpen, setIsPetModalOpen] = useState(false);
    const [isVeiculoModalOpen, setIsVeiculoModalOpen] = useState(false);
    
    const handleEnderecoChange = (tipo, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [tipo]: { ...prev[tipo], [name]: value } }));
    };
    
    const handleCepBlur = async (tipo) => {
        const cep = formData[tipo].cep.replace(/\D/g, '');
        if (cep.length !== 8) return;
        try {
            const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (!data.erro) {
                setFormData(prev => ({ ...prev, [tipo]: { ...prev[tipo], cidade: `${data.localidade} - ${data.uf}`, bairro: data.bairro, rua: data.logradouro }}));
            }
        } catch (error) { 
            console.error("Erro ao buscar CEP:", error); 
        }
    };
    
    const handleServicoChange = (e) => {
        const { name, checked } = e.target;
        if (name === 'pet') {
            if (checked) setIsPetModalOpen(true);
            else setFormData(prev => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, pet: null } }));
        } else if (name === 'veiculo') {
            if (checked) setIsVeiculoModalOpen(true);
            else setFormData(prev => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, veiculo: null } }));
        } else {
            setFormData(prev => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, [name]: checked }}));
        }
    };
    
    const handleSavePetData = (petData) => {
        setFormData(prev => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, pet: petData } }));
    };
    
    const handleSaveVeiculoData = (veiculoData) => {
        setFormData(prev => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, veiculo: veiculoData } }));
    };
    
    const handleComodoNomeChange = (comodoId, novoNome) => setFormData(prev => ({ 
        ...prev, 
        comodos: prev.comodos.map(c => c.id === comodoId ? { ...c, nome: novoNome } : c) 
    }));
    
    const handleAddItem = (comodoId) => setFormData(prev => ({ 
        ...prev, 
        comodos: prev.comodos.map(c => 
            c.id === comodoId ? { ...c, itens: [...c.itens, { id: Date.now(), nome: '', qt: 1 }] } : c
        ) 
    }));
    
    const handleRemoveItem = (comodoId, itemId) => setFormData(prev => ({ 
        ...prev, 
        comodos: prev.comodos.map(c => 
            c.id === comodoId ? { ...c, itens: c.itens.filter(i => i.id !== itemId) } : c
        ) 
    }));
    
    const handleItemChange = (comodoId, itemId, campo, valor) => setFormData(prev => ({ 
        ...prev, 
        comodos: prev.comodos.map(c => 
            c.id === comodoId ? { ...c, itens: c.itens.map(i => 
                i.id === itemId ? { ...i, [campo]: valor } : i
            ) } : c
        ) 
    }));
    
    const handleAddComodo = () => setFormData(prev => ({ 
        ...prev, 
        comodos: [...prev.comodos, { 
            id: Date.now(), 
            nome: 'Novo Cômodo', 
            itens: [{ id: Date.now() + 1, nome: '', qt: 1 }] 
        }] 
    }));
    
    const handleRemoveComodo = (comodoId) => { 
        if (formData.comodos.length > 1) {
            setFormData(prev => ({ 
                ...prev, 
                comodos: prev.comodos.filter(c => c.id !== comodoId) 
            }));
        }
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
        <>
            <PetFormModal 
                isOpen={isPetModalOpen} 
                onClose={() => setIsPetModalOpen(false)} 
                onSave={handleSavePetData} 
            />
            
            <VeiculoFormModal 
                isOpen={isVeiculoModalOpen} 
                onClose={() => setIsVeiculoModalOpen(false)} 
                onSave={handleSaveVeiculoData} 
            />
            
            <div className="p-4 md:p-8 bg-brand-background min-h-screen">
                <h1 className="text-3xl font-bold mb-6 text-brand-text-primary">Solicitar Minha Mudança</h1>
                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">1. Endereços</h2>
                        <div className="space-y-6">
                            <CampoEndereco 
                                tipo="origem" 
                                dados={formData.origem} 
                                onChange={(e) => handleEnderecoChange('origem', e)} 
                                onCepBlur={() => handleCepBlur('origem')} 
                            />
                            <hr/>
                            <CampoEndereco 
                                tipo="destino" 
                                dados={formData.destino} 
                                onChange={(e) => handleEnderecoChange('destino', e)} 
                                onCepBlur={() => handleCepBlur('destino')} 
                            />
                        </div>
                    </div>
                    
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">2. Detalhes da Mudança</h2>
                        <div className="space-y-4">
                            {formData.comodos.map(comodo => (
                                <InventarioComodo 
                                    key={comodo.id} 
                                    comodo={comodo} 
                                    onComodoChange={handleComodoNomeChange} 
                                    onRemoveComodo={formData.comodos.length > 1 ? handleRemoveComodo : null}
                                    onAddItem={handleAddItem} 
                                    onRemoveItem={handleRemoveItem} 
                                    onItemChange={handleItemChange}
                                />
                            ))}
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAddComodo} 
                            className="mt-4 text-brand-blue font-semibold flex items-center"
                        >
                            <FaPlus className="mr-2" /> Adicionar Cômodo
                        </button>
                    </div>
                    
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">3. Serviços Adicionais</h2>
                        <div className="space-y-4">
                            <CheckboxServico 
                                id="empacotamento" 
                                name="empacotamento" 
                                label="Preciso do serviço de empacotamento" 
                                Icon={FaBoxOpen} 
                                checked={formData.servicosAdicionais.empacotamento} 
                                onChange={handleServicoChange} 
                            />
                            <CheckboxServico 
                                id="pet" 
                                name="pet" 
                                label="Preciso transportar um Pet" 
                                Icon={FaPaw} 
                                checked={!!formData.servicosAdicionais.pet} 
                                onChange={handleServicoChange} 
                            />
                            <CheckboxServico 
                                id="veiculo" 
                                name="veiculo" 
                                label="Preciso transportar um Veículo (moto/carro)" 
                                Icon={FaMotorcycle} 
                                checked={!!formData.servicosAdicionais.veiculo} 
                                onChange={handleServicoChange} 
                            />
                            
                            {/* Exibir informações do veículo se estiverem preenchidas */}
                            {formData.servicosAdicionais.veiculo && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                                    <p className="text-sm font-medium text-blue-800">
                                        Veículo: {formData.servicosAdicionais.veiculo.tipo === 'carro' ? 'Carro' : 'Moto'} - {formData.servicosAdicionais.veiculo.modelo}
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        Quantidade: {formData.servicosAdicionais.veiculo.quantidade}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-green-600 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                        <FaPaperPlane className="mr-3" />
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enviando...
                            </span>
                        ) : 'Enviar Solicitação'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default SolicitarMudanca;