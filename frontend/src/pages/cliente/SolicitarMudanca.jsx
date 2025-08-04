// C:\dev\frontend\src\pages\cliente\SolicitarMudanca.jsx
// VERSÃO APRIMORADA - Protocolo DEV.SENIOR
import React, { useState, useMemo, useCallback } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaPaperPlane, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaHome, FaListOl } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useMudanca } from '../../contexts/MudancaContext';
import axios from 'axios';
import PetFormModal from '../../components/shared/PetFormModal';
import VeiculoFormModal from '../../components/shared/VeiculoFormModal';

// --- SUB-COMPONENTES LÓGICOS (Melhor Organização) ---

// Componente para um único item dentro de um cômodo
const ItemInputRow = ({ item, onchange, onremove, isediting }) => (
    <div className="flex items-center gap-2">
        <input
            type="text"
            value={item.nome}
            onChange={(e) => onchange(item.id, 'nome', e.target.value)}
            placeholder={`Nome do Item`}
            className={`flex-grow p-2 border rounded-md ${!isediting ? 'bg-gray-100' : ''}`}
            aria-label={`Nome do item ${item.nome}`}
            readOnly={!isediting}
            required
        />
        <input
            type="number"
            value={item.qt}
            onChange={(e) => onchange(item.id, 'qt', parseInt(e.target.value, 10))}
            placeholder="Qt"
            min="1"
            className={`w-20 p-2 border rounded-md ${!isediting ? 'bg-gray-100' : ''}`}
            aria-label={`Quantidade do item ${item.nome}`}
            readOnly={!isediting}
            required
        />
        {isediting && (
            <button
                type="button"
                onClick={() => onremove(item.id)}
                className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                aria-label={`Remover item ${item.nome}`}
            >
                <FaTrash />
            </button>
        )}
    </div>
);

// Componente para um Cômodo completo
const ComodoCard = ({ comodo, onchange, onremove, iscustom }) => {
    const { 
        onAddItem, 
        onRemoveItem, 
        onItemChange, 
        onNomeChange,
        onStartEditing, 
        onCancelEditing, 
        onSaveEditing 
    } = onchange;

    return (
        <div className="border p-4 rounded-md space-y-3 bg-gray-50 shadow-sm">
            <div className="flex justify-between items-center">
                {comodo.isEditing ? (
                     <input 
                        type="text" 
                        value={comodo.nome} 
                        onChange={(e) => onNomeChange(comodo.id, e.target.value)}
                        className="font-semibold text-lg p-1 border-b-2 border-brand-blue"
                        autoFocus
                    />
                ) : (
                    <h3 className="font-semibold text-lg">{comodo.nome}</h3>
                )}

                <div className="flex gap-2">
                    {comodo.isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={() => onSaveEditing(comodo.id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Salvar Alterações"
                            >
                                <FaSave />
                            </button>
                            <button
                                type="button"
                                onClick={() => onCancelEditing(comodo.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Cancelar Edição"
                            >
                                <FaTimes />
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => onStartEditing(comodo.id)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Editar Cômodo e Itens"
                        >
                            <FaEdit />
                        </button>
                    )}
                     {iscustom && !comodo.isEditing && (
                        <button
                            type="button"
                            onClick={() => onremove(comodo.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remover Cômodo"
                        >
                            <FaTrash />
                        </button>
                    )}
                </div>
            </div>

            {comodo.itens.map(item => (
                <ItemInputRow
                    key={item.id}
                    item={item}
                    onchange={(itemId, campo, valor) => onItemChange(comodo.id, itemId, campo, valor)}
                    onremove={(itemId) => onRemoveItem(comodo.id, itemId)}
                    isediting={comodo.isEditing}
                />
            ))}

            {comodo.isEditing && (
                <button
                    type="button"
                    onClick={() => onAddItem(comodo.id)}
                    className="text-brand-blue font-semibold text-sm flex items-center mt-2"
                >
                    <FaPlus className="mr-1" /> Adicionar Item
                </button>
            )}
        </div>
    );
};

// Componente para o formulário de endereço
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
                className="p-2 border rounded-md md:col-span-4"
                aria-label="Complemento ou ponto de referência"
            ></textarea>
        </div>
    </div>
);

// Componente para os checkboxes de serviços
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


// --- COMPONENTE PRINCIPAL (Orquestrador) ---

const SolicitarMudanca = () => {
    const navigate = useNavigate();
    const { solicitarNovaMudanca, loading, error } = useMudanca();

    const [isPetModalOpen, setIsPetModalOpen] = useState(false);
    const [isVeiculoModalOpen, setIsVeiculoModalOpen] = useState(false);

    // Estado para backup durante a edição não-destrutiva
    const [editingBackup, setEditingBackup] = useState(null);

    const [formData, setFormData] = useState({
        origem: { cep: '', cidade: '', bairro: '', rua: '', numero: '', referencia: '' },
        destino: { cep: '', cidade: '', bairro: '', rua: '', numero: '', referencia: '' },
        comodos: [
            { id: 1, nome: 'Sala', isCustom: false, isEditing: false, itens: [ { id: 101, nome: 'SOFÁ', qt: 1 }, { id: 102, nome: 'estante', qt: 1 }, { id: 103, nome: 'RACK', qt: 1 }, { id: 104, nome: 'TV', qt: 1 } ] },
            { id: 2, nome: 'Cozinha', isCustom: false, isEditing: false, itens: [ { id: 201, nome: 'FOGÃO', qt: 1 }, { id: 202, nome: 'geladeira', qt: 1 }, { id: 203, nome: 'BUJÃO', qt: 1 }, { id: 204, nome: 'MESA', qt: 1 }, { id: 205, nome: 'CADEIRAS', qt: 4 }, { id: 206, nome: 'MICROONDAS', qt: 1 }, { id: 207, nome: 'FORNO ELÉTRICO', qt: 1 }, { id: 208, nome: 'FILTRO', qt: 1 }, { id: 209, nome: 'ARMÁRIO DE COZINHA', qt: 1 } ] },
            { id: 3, nome: 'Quarto 1', isCustom: false, isEditing: false, itens: [ { id: 301, nome: 'CAMA', qt: 1 }, { id: 302, nome: 'GUARDA-ROUPAS', qt: 1 }, { id: 303, nome: 'CÔMODA', qt: 1 }, { id: 304, nome: 'VENTILADOR', qt: 1 }, { id: 305, nome: 'SAPATEIRA', qt: 1 }, { id: 306, nome: 'ESPELHO', qt: 1 } ] },
            { id: 4, nome: 'Quarto 2', isCustom: false, isEditing: false, itens: [ { id: 401, nome: 'CAMA', qt: 1 }, { id: 402, nome: 'GUARDA-ROUPAS', qt: 1 }, { id: 403, nome: 'CÔMODA', qt: 1 }, { id: 404, nome: 'ESPELHO', qt: 1 } ] },
            { id: 5, nome: 'Lavanderia / Área de Serviço', isCustom: false, isEditing: false, itens: [ { id: 501, nome: 'MÁQUINA DE LAVAR', qt: 1 }, { id: 502, nome: 'TANQUINHO', qt: 1 } ] }
        ],
        servicosAdicionais: { empacotamento: false, pet: null, veiculo: null }
    });

    // --- LÓGICA DE CÁLCULO OTIMIZADA ---
    const { totalComodos, totalItens, estimativaCaixas, estimativaSacos } = useMemo(() => {
        const comodosCount = formData.comodos.length;
        const itensCount = formData.comodos.reduce((total, comodo) => 
            total + comodo.itens.reduce((soma, item) => soma + (item.qt || 0), 0)
        , 0);

        return {
            totalComodos: comodosCount,
            totalItens: itensCount,
            estimativaCaixas: Math.ceil(itensCount / 5) || 0,
            estimativaSacos: Math.ceil(itensCount / 3) || 0,
        };
    }, [formData.comodos]);


    // --- HANDLERS DE FORMULÁRIO (Encapsulados e Otimizados com useCallback) ---
    
    const handleEnderecoChange = useCallback((tipo, e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [tipo]: { ...prev[tipo], [name]: value } }));
    }, []);

    const handleCepBlur = useCallback(async (tipo) => {
        const cep = formData[tipo].cep.replace(/\D/g, '');
        if (cep.length !== 8) return;
        try {
            const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (!data.erro) {
                setFormData(prev => ({ ...prev, [tipo]: { ...prev[tipo], cidade: `${data.localidade} - ${data.uf}`, bairro: data.bairro, rua: data.logradouro } }));
            }
        } catch (error) { console.error("Erro ao buscar CEP:", error); }
    }, [formData.origem.cep, formData.destino.cep]);

    const handleServicoChange = useCallback((e) => {
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
    }, []);
    
    const handleSavePetData = useCallback((petData) => setFormData(prev => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, pet: petData } })), []);
    const handleSaveVeiculoData = useCallback((veiculoData) => setFormData(prev => ({ ...prev, servicosAdicionais: { ...prev.servicosAdicionais, veiculo: veiculoData } })), []);

    // --- HANDLERS DOS CÔMODOS (Lógica robusta) ---

    const handleAddComodo = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            comodos: [...prev.comodos, {
                id: Date.now(),
                nome: 'Novo Cômodo',
                isCustom: true,
                isEditing: true, // Começa editando
                itens: [{ id: Date.now() + 1, nome: '', qt: 1 }]
            }]
        }));
    }, []);

    const handleRemoveComodo = useCallback((comodoId) => {
        setFormData(prev => ({ ...prev, comodos: prev.comodos.filter(c => c.id !== comodoId) }));
    }, []);
    
    // Lógica de Edição NÃO-DESTRUTIVA
    const handleStartEditing = useCallback((comodoId) => {
        const comodoToEdit = formData.comodos.find(c => c.id === comodoId);
        // Cria um backup profundo para garantir que objetos aninhados (itens) sejam copiados
        setEditingBackup(JSON.parse(JSON.stringify(comodoToEdit)));

        setFormData(prev => ({ ...prev, comodos: prev.comodos.map(c => c.id === comodoId ? { ...c, isEditing: true } : c) }));
    }, [formData.comodos]);

    const handleCancelEditing = useCallback((comodoId) => {
        if (!editingBackup || editingBackup.id !== comodoId) return;
        // Restaura o cômodo a partir do backup
        setFormData(prev => ({ ...prev, comodos: prev.comodos.map(c => c.id === comodoId ? editingBackup : c) }));
        setEditingBackup(null); // Limpa o backup
    }, [editingBackup]);

    const handleSaveEditing = useCallback((comodoId) => {
        setFormData(prev => ({ ...prev, comodos: prev.comodos.map(c => c.id === comodoId ? { ...c, isEditing: false } : c) }));
        setEditingBackup(null); // Apenas limpa o backup, consolidando as alterações
    }, []);

    const handleComodoNomeChange = useCallback((comodoId, novoNome) => {
        setFormData(prev => ({ ...prev, comodos: prev.comodos.map(c => c.id === comodoId ? { ...c, nome: novoNome } : c) }));
    }, []);

    const handleAddItem = useCallback((comodoId) => {
        setFormData(prev => ({ ...prev, comodos: prev.comodos.map(c => c.id === comodoId ? { ...c, itens: [...c.itens, { id: Date.now(), nome: '', qt: 1 }] } : c) }));
    }, []);

    const handleRemoveItem = useCallback((comodoId, itemId) => {
        setFormData(prev => ({ ...prev, comodos: prev.comodos.map(c => c.id === comodoId ? { ...c, itens: c.itens.filter(i => i.id !== itemId) } : c) }));
    }, []);

    const handleItemChange = useCallback((comodoId, itemId, campo, valor) => {
        setFormData(prev => ({ ...prev, comodos: prev.comodos.map(c => c.id === comodoId ? { ...c, itens: c.itens.map(i => i.id === itemId ? { ...i, [campo]: valor } : i) } : c) }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Remove o estado temporário 'isEditing' antes de enviar para a API
        const dataToSubmit = {
            ...formData,
            comodos: formData.comodos.map(({ isEditing, ...restoDoComodo }) => restoDoComodo)
        };
        const { success } = await solicitarNovaMudanca(dataToSubmit);
        if (success) {
            alert("Solicitação enviada com sucesso!");
            navigate('/cliente/dashboard');
        }
    };

    return (
        <>
            <PetFormModal isOpen={isPetModalOpen} onClose={() => setIsPetModalOpen(false)} onSave={handleSavePetData} />
            <VeiculoFormModal isOpen={isVeiculoModalOpen} onClose={() => setIsVeiculoModalOpen(false)} onSave={handleSaveVeiculoData} />
            
            <div className="p-4 md:p-8 bg-brand-background min-h-screen">
                <h1 className="text-3xl font-bold mb-6 text-brand-text-primary text-center">Solicitar Minha Mudança</h1>
                
                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                    {/* Seção 1: Endereços */}
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">1. Endereços</h2>
                        <div className="space-y-6">
                            <CampoEndereco tipo="origem" dados={formData.origem} onChange={handleEnderecoChange} onCepBlur={() => handleCepBlur('origem')} />
                            <hr/>
                            <CampoEndereco tipo="destino" dados={formData.destino} onChange={handleEnderecoChange} onCepBlur={() => handleCepBlur('destino')} />
                        </div>
                    </div>
                    
                    {/* Seção 2: Detalhes da Mudança */}
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">2. Detalhes da Mudança</h2>
                        <div className="space-y-4">
                            {formData.comodos.map(comodo => (
                                <ComodoCard
                                    key={comodo.id}
                                    comodo={comodo}
                                    onchange={{ onAddItem, onRemoveItem, onItemChange, onNomeChange, onStartEditing, onCancelEditing, onSaveEditing }}
                                    onremove={handleRemoveComodo}
                                    iscustom={comodo.isCustom}
                                />
                            ))}
                        </div>
                        <button type="button" onClick={handleAddComodo} className="mt-4 text-brand-blue font-semibold flex items-center justify-center w-full p-2 hover:bg-blue-50 rounded-md">
                            <FaPlus className="mr-2" /> Adicionar Outro Cômodo
                        </button>
                    </div>

                    {/* Seção 3: Serviços Adicionais */}
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">3. Serviços Adicionais</h2>
                        <div className="space-y-4">
                            <CheckboxServico id="empacotamento" name="empacotamento" label="Preciso do serviço de empacotamento" Icon={FaBoxOpen} checked={formData.servicosAdicionais.empacotamento} onChange={handleServicoChange} />
                            <CheckboxServico id="pet" name="pet" label="Preciso transportar um Pet" Icon={FaPaw} checked={!!formData.servicosAdicionais.pet} onChange={handleServicoChange} />
                            <CheckboxServico id="veiculo" name="veiculo" label="Preciso transportar um Veículo (moto/carro)" Icon={FaMotorcycle} checked={!!formData.servicosAdicionais.veiculo} onChange={handleServicoChange} />
                            
                            {formData.servicosAdicionais.veiculo && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200 text-sm"> Veículo: {formData.servicosAdicionais.veiculo.tipo} - {formData.servicosAdicionais.veiculo.modelo} (Qtd: {formData.servicosAdicionais.veiculo.quantidade})</div>
                            )}
                            {formData.servicosAdicionais.pet && (
                                <div className="mt-2 p-3 bg-yellow-50 rounded-md border border-yellow-200 text-sm"> Pet: {formData.servicosAdicionais.pet.raca} (Qtd: {formData.servicosAdicionais.pet.quantidade}, Tamanho: {formData.servicosAdicionais.pet.tamanho}) - {formData.servicosAdicionais.pet.possuiGaiola ? 'Possui gaiola' : 'Não possui gaiola'}</div>
                            )}
                        </div>
                    </div>
                    
                    {/* NOVA Seção 4: Resumo da Mudança */}
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">4. Resumo da Mudança</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-white p-4 rounded-md shadow-sm">
                                <FaHome className="mx-auto text-2xl text-brand-blue mb-2"/>
                                <h3 className="font-semibold text-gray-600">Total de Cômodos</h3>
                                <p className="text-2xl font-bold text-gray-800">{totalComodos}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow-sm">
                                <FaListOl className="mx-auto text-2xl text-brand-blue mb-2"/>
                                <h3 className="font-semibold text-gray-600">Total de Itens</h3>
                                <p className="text-2xl font-bold text-gray-800">{totalItens}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow-sm">
                                <h3 className="font-semibold text-gray-600">Estimativa de Caixas</h3>
                                <p className="text-2xl font-bold text-gray-800">{estimativaCaixas}</p>
                            </div>
                            <div className="bg-white p-4 rounded-md shadow-sm">
                                <h3 className="font-semibold text-gray-600">Estimativa de Sacolas</h3>
                                <p className="text-2xl font-bold text-gray-800">{estimativaSacos}</p>
                            </div>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                        <FaPaperPlane className="mr-3" />
                        {loading ? 'Enviando...' : 'Enviar Solicitação'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default SolicitarMudanca;