// C:\dev\frontend\src\pages\cliente\SolicitarMudanca.jsx
import React, { useState } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaPaperPlane, FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useMudanca } from '../../contexts/MudancaContext';
import axios from 'axios';
import PetFormModal from '../../components/shared/PetFormModal';
import VeiculoFormModal from '../../components/shared/VeiculoFormModal';

// Componente para os itens fixos dos cômodos
const ComodoFixo = ({ comodo, onItemChange, onRemoveItem, onAddItem, onRemoveComodo, editando, setEditando }) => {
    return (
        <div className="border p-4 rounded-md space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{comodo.nome}</h3>
                <div className="flex gap-2">
                    {editando ? (
                        <>
                            <button 
                                type="button" 
                                onClick={() => setEditando(false)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Salvar"
                            >
                                <FaSave />
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setEditando(false)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Cancelar"
                            >
                                <FaTimes />
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                type="button" 
                                onClick={() => setEditando(true)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Editar"
                            >
                                <FaEdit />
                            </button>
                            {onRemoveComodo && (
                                <button 
                                    type="button" 
                                    onClick={() => onRemoveComodo(comodo.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Remover cômodo"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </>
                    )}
                </div>
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
                        readOnly={!editando}
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
                        readOnly={!editando}
                        required
                    />
                    {editando && (
                        <button 
                            type="button" 
                            onClick={() => onRemoveItem(comodo.id, item.id)} 
                            className="text-gray-400 hover:text-red-600 p-1"
                            aria-label="Remover item"
                        >
                            <FaTrash />
                        </button>
                    )}
                </div>
            ))}
            {editando && (
                <button 
                    type="button" 
                    onClick={() => onAddItem(comodo.id)} 
                    className="text-brand-blue font-semibold text-sm flex items-center"
                >
                    <FaPlus className="mr-1" aria-hidden="true" /> Adicionar Item
                </button>
            )}
        </div>
    );
};

// Componente principal
const SolicitarMudanca = () => {
    const navigate = useNavigate();
    const { solicitarNovaMudanca, loading, error } = useMudanca();
    
    // Estado para controlar os modais
    const [isPetModalOpen, setIsPetModalOpen] = useState(false);
    const [isVeiculoModalOpen, setIsVeiculoModalOpen] = useState(false);
    
    // Estados para controlar a edição dos cômodos
    const [editandoComodos, setEditandoComodos] = useState({});
    
    // Dados iniciais dos cômodos fixos
    const comodosFixos = [
        {
            id: 1,
            nome: 'Sala',
            itens: [
                { id: 101, nome: 'SOFÁ', qt: 1 },
                { id: 102, nome: 'estante', qt: 1 },
                { id: 103, nome: 'RACK', qt: 1 },
                { id: 104, nome: 'TV', qt: 1 }
            ]
        },
        {
            id: 2,
            nome: 'Cozinha',
            itens: [
                { id: 201, nome: 'FOGÃO', qt: 1 },
                { id: 202, nome: 'geladeira', qt: 1 },
                { id: 203, nome: 'BUJÃO', qt: 1 },
                { id: 204, nome: 'MESA', qt: 1 },
                { id: 205, nome: 'CADEIRAS', qt: 4 },
                { id: 206, nome: 'MICROONDAS', qt: 1 },
                { id: 207, nome: 'FORNO ELÉTRICO', qt: 1 },
                { id: 208, nome: 'FILTRO', qt: 1 },
                { id: 209, nome: 'ARMÁRIO DE COZINHA', qt: 1 }
            ]
        },
        {
            id: 3,
            nome: 'Quarto 1',
            itens: [
                { id: 301, nome: 'CAMA', qt: 1 },
                { id: 302, nome: 'GUARDA-ROUPAS', qt: 1 },
                { id: 303, nome: 'CÔMODA', qt: 1 },
                { id: 304, nome: 'VENTILADOR', qt: 1 },
                { id: 305, nome: 'SAPATEIRA', qt: 1 },
                { id: 306, nome: 'ESPELHO', qt: 1 }
            ]
        },
        {
            id: 4,
            nome: 'Quarto 2',
            itens: [
                { id: 401, nome: 'CAMA', qt: 1 },
                { id: 402, nome: 'GUARDA-ROUPAS', qt: 1 },
                { id: 403, nome: 'CÔMODA', qt: 1 },
                { id: 404, nome: 'ESPELHO', qt: 1 }
            ]
        },
        {
            id: 5,
            nome: 'Lavanderia / Área de Serviço',
            itens: [
                { id: 501, nome: 'MÁQUINA DE LAVAR', qt: 1 },
                { id: 502, nome: 'TANQUINHO', qt: 1 }
            ]
        }
    ];
    
    const [formData, setFormData] = useState({
        origem: { cep: '', cidade: '', bairro: '', rua: '', numero: '', referencia: '' },
        destino: { cep: '', cidade: '', bairro: '', rua: '', numero: '', referencia: '' },
        comodos: comodosFixos,
        servicosAdicionais: { empacotamento: false, pet: null, veiculo: null }
    });
    
    // Calcular o total de volumes
    const calcularTotalVolumes = () => {
        return formData.comodos.reduce((total, comodo) => {
            return total + comodo.itens.reduce((soma, item) => soma + parseInt(item.qt || 0), 0);
        }, 0);
    };
    
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
                setFormData(prev => ({ 
                    ...prev, 
                    [tipo]: { 
                        ...prev[tipo], 
                        cidade: `${data.localidade} - ${data.uf}`, 
                        bairro: data.bairro, 
                        rua: data.logradouro 
                    } 
                }));
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
    
    const toggleEditandoComodo = (comodoId) => {
        setEditandoComodos(prev => ({
            ...prev,
            [comodoId]: !prev[comodoId]
        }));
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
                <h1 className="text-3xl font-bold mb-6 text-brand-text-primary text-center">Solicitar Minha Mudança</h1>
                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                    {/* Seção 1: Endereços */}
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">1. Endereços</h2>
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
                    
                    {/* Seção 2: Detalhes da Mudança */}
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">2. Detalhes da Mudança</h2>
                        <div className="space-y-4">
                            {formData.comodos.map(comodo => (
                                <ComodoFixo 
                                    key={comodo.id} 
                                    comodo={comodo} 
                                    onComodoChange={handleComodoNomeChange} 
                                    onRemoveComodo={formData.comodos.length > 1 ? handleRemoveComodo : null}
                                    onAddItem={handleAddItem} 
                                    onRemoveItem={handleRemoveItem} 
                                    onItemChange={handleItemChange}
                                    editando={editandoComodos[comodo.id] || false}
                                    setEditando={() => toggleEditandoComodo(comodo.id)}
                                />
                            ))}
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAddComodo} 
                            className="mt-4 text-brand-blue font-semibold flex items-center justify-center w-full"
                        >
                            <FaPlus className="mr-2" /> Adicionar Cômodo
                        </button>
                    </div>
                    
                    {/* Seção 3: Serviços Adicionais */}
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">3. Serviços Adicionais</h2>
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
                            
                            {/* Exibir informações do pet se estiverem preenchidas */}
                            {formData.servicosAdicionais.pet && (
                                <div className="mt-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                                    <p className="text-sm font-medium text-yellow-800">
                                        Pet: {formData.servicosAdicionais.pet.quantidade} animal(is) - {formData.servicosAdicionais.pet.raca}
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        Tamanho: {formData.servicosAdicionais.pet.tamanho}
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        {formData.servicosAdicionais.pet.possuiGaiola ? 'Possui gaiola' : 'Não possui gaiola'}
                                    </p>
                                    <div className="mt-2 bg-yellow-100 p-3 rounded-md text-yellow-800 text-sm">
                                        <strong>Atenção:</strong> A alimentação e os produtos de higiene do pet durante a viagem são de responsabilidade do cliente. Agradecemos a compreensão.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Seção 4: Total de Volumes de Embalagens */}
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">4. TOTAL DE VOLUMES DE EMBALAGENS</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-md">
                                <h3 className="font-semibold mb-2 text-center">ESTIMATIVA DE CAIXAS DE PAPELÃO</h3>
                                <p className="text-2xl font-bold text-center">{Math.ceil(calcularTotalVolumes() / 5)}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md">
                                <h3 className="font-semibold mb-2 text-center">ESTIMATIVA DE SACOLAS</h3>
                                <p className="text-2xl font-bold text-center">{Math.ceil(calcularTotalVolumes() / 3)}</p>
                            </div>
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

// Componentes auxiliares
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
        <h3 className="text-xl font-semibold text-gray-700 mb-3 text-center">
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

export default SolicitarMudanca;