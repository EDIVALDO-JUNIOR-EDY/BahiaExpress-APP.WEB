// C:\dev\frontend\src\pages\cliente\SolicitarMudanca.jsx
// VERSÃO ARQUITETÔNICA APRIMORADA - Protocolo DEV.SENIOR

import React, { useState, useMemo, useReducer } from 'react';
import { FaPaw, FaMotorcycle, FaBoxOpen, FaPaperPlane, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaHome, FaListOl } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useMudanca } from '../../contexts/MudancaContext';
import axios from 'axios';
import PetFormModal from '../../components/shared/PetFormModal';
import VeiculoFormModal from '../../components/shared/VeiculoFormModal';

// --- Estado Inicial e Reducer para Gerenciamento Centralizado ---

const initialState = {
    origem: { cep: '', cidade: '', bairro: '', rua: '', numero: '', referencia: '' },
    destino: { cep: '', cidade: '', bairro: '', rua: '', numero: '', referencia: '' },
    comodos: [
        { id: 1, nome: 'Sala', isCustom: false, isEditing: false, itens: [ { id: 101, nome: 'SOFÁ', qt: 1 }, { id: 102, nome: 'estante', qt: 1 }, { id: 103, nome: 'RACK', qt: 1 }, { id: 104, nome: 'TV', qt: 1 } ] },
        { id: 2, nome: 'Cozinha', isCustom: false, isEditing: false, itens: [ { id: 201, nome: 'FOGÃO', qt: 1 }, { id: 202, nome: 'geladeira', qt: 1 }, { id: 203, nome: 'BUJÃO', qt: 1 }, { id: 204, nome: 'MESA', qt: 1 }, { id: 205, nome: 'CADEIRAS', qt: 4 }, { id: 206, nome: 'MICROONDAS', qt: 1 }, { id: 207, nome: 'FORNO ELÉTRICO', qt: 1 }, { id: 208, nome: 'FILTRO', qt: 1 }, { id: 209, nome: 'ARMÁRIO DE COZINHA', qt: 1 } ] },
        { id: 3, nome: 'Quarto 1', isCustom: false, isEditing: false, itens: [ { id: 301, nome: 'CAMA', qt: 1 }, { id: 302, nome: 'GUARDA-ROUPAS', qt: 1 }, { id: 303, nome: 'CÔMODA', qt: 1 }, { id: 304, nome: 'VENTILADOR', qt: 1 }, { id: 305, nome: 'SAPATEIRA', qt: 1 }, { id: 306, nome: 'ESPELHO', qt: 1 } ] },
        { id: 4, nome: 'Quarto 2', isCustom: false, isEditing: false, itens: [ { id: 401, nome: 'CAMA', qt: 1 }, { id: 402, nome: 'GUARDA-ROUPAS', qt: 1 }, { id: 403, nome: 'CÔMODA', qt: 1 }, { id: 404, nome: 'ESPELHO', qt: 1 } ] },
        { id: 5, nome: 'Lavanderia / Área de Serviço', isCustom: false, isEditing: false, itens: [ { id: 501, nome: 'MÁQUINA DE LAVAR', qt: 1 }, { id: 502, nome: 'TANQUINHO', qt: 1 } ] }
    ],
    servicosAdicionais: { empacotamento: false, pet: null, veiculo: null },
    editingBackup: null, // Estado para backup durante a edição
};

function mudancaFormReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_ENDERECO':
            const { tipo, name, value } = action.payload;
            return { ...state, [tipo]: { ...state[tipo], [name]: value } };
        
        case 'UPDATE_ENDERECO_CEP':
            const { tipoCep, data } = action.payload;
            return { ...state, [tipoCep]: { ...state[tipoCep], cidade: `${data.localidade} - ${data.uf}`, bairro: data.bairro, rua: data.logradouro } };

        case 'UPDATE_SERVICO_ADICIONAL':
            const { serviceName, isChecked, dataValue } = action.payload;
            return { ...state, servicosAdicionais: { ...state.servicosAdicionais, [serviceName]: isChecked ? (dataValue !== undefined ? dataValue : true) : (dataValue !== undefined ? null : false) } };

        case 'ADD_COMODO':
            return { ...state, comodos: [...state.comodos, { id: Date.now(), nome: 'Novo Cômodo', isCustom: true, isEditing: true, itens: [{ id: Date.now() + 1, nome: '', qt: 1 }] }] };

        case 'REMOVE_COMODO':
            if (state.comodos.length <= 1) return state;
            return { ...state, comodos: state.comodos.filter(c => c.id !== action.payload.comodoId) };
        
        case 'START_EDITING_COMODO':
            const comodoToEdit = state.comodos.find(c => c.id === action.payload.comodoId);
            return { ...state, editingBackup: JSON.parse(JSON.stringify(comodoToEdit)), comodos: state.comodos.map(c => c.id === action.payload.comodoId ? { ...c, isEditing: true } : c) };

        case 'CANCEL_EDITING_COMODO':
            if (!state.editingBackup) return state;
            return { ...state, comodos: state.comodos.map(c => c.id === action.payload.comodoId ? state.editingBackup : c), editingBackup: null };

        case 'SAVE_EDITING_COMODO':
            return { ...state, comodos: state.comodos.map(c => c.id === action.payload.comodoId ? { ...c, isEditing: false } : c), editingBackup: null };
            
        case 'UPDATE_COMODO_NOME':
            return { ...state, comodos: state.comodos.map(c => c.id === action.payload.comodoId ? { ...c, nome: action.payload.novoNome } : c) };

        case 'ADD_ITEM':
            return { ...state, comodos: state.comodos.map(c => c.id === action.payload.comodoId ? { ...c, itens: [...c.itens, { id: Date.now(), nome: '', qt: 1 }] } : c) };

        case 'REMOVE_ITEM':
            return { ...state, comodos: state.comodos.map(c => c.id === action.payload.comodoId ? { ...c, itens: c.itens.filter(i => i.id !== action.payload.itemId) } : c) };

        case 'UPDATE_ITEM':
            const { comodoId, itemId, campo, valor } = action.payload;
            return { ...state, comodos: state.comodos.map(c => c.id === comodoId ? { ...c, itens: c.itens.map(i => i.id === itemId ? { ...i, [campo]: valor } : i) } : c) };

        default:
            throw new Error(`Ação não tratada: ${action.type}`);
    }
}

// --- SUB-COMPONENTES LÓGICOS (Agora mais simples, usando 'dispatch') ---

const ComodoCard = ({ comodo, dispatch, isCustom }) => (
    <div className="border p-4 rounded-md space-y-3 bg-gray-50 shadow-sm">
        <div className="flex justify-between items-center">
            {comodo.isEditing ? (<input type="text" value={comodo.nome} onChange={(e) => dispatch({ type: 'UPDATE_COMODO_NOME', payload: { comodoId: comodo.id, novoNome: e.target.value } })} className="font-semibold text-lg p-1 border-b-2 border-brand-blue" autoFocus />) : (<h3 className="font-semibold text-lg">{comodo.nome}</h3>)}
            <div className="flex gap-2">
                {comodo.isEditing ? (
                    <>
                        <button type="button" onClick={() => dispatch({ type: 'SAVE_EDITING_COMODO', payload: { comodoId: comodo.id } })} className="text-green-600 hover:text-green-800 p-1" title="Salvar"><FaSave /></button>
                        <button type="button" onClick={() => dispatch({ type: 'CANCEL_EDITING_COMODO', payload: { comodoId: comodo.id } })} className="text-red-600 hover:text-red-800 p-1" title="Cancelar"><FaTimes /></button>
                    </>
                ) : ( <button type="button" onClick={() => dispatch({ type: 'START_EDITING_COMODO', payload: { comodoId: comodo.id } })} className="text-blue-600 hover:text-blue-800 p-1" title="Editar"><FaEdit /></button> )}
                {isCustom && !comodo.isEditing && (<button type="button" onClick={() => dispatch({ type: 'REMOVE_COMODO', payload: { comodoId: comodo.id } })} className="text-red-500 hover:text-red-700 p-1" title="Remover"><FaTrash /></button>)}
            </div>
        </div>
        {comodo.itens.map(item => (
            <div className="flex items-center gap-2" key={item.id}>
                <input type="text" value={item.nome} onChange={(e) => dispatch({ type: 'UPDATE_ITEM', payload: { comodoId: comodo.id, itemId: item.id, campo: 'nome', value: e.target.value } })} placeholder={`Nome do Item`} className={`flex-grow p-2 border rounded-md ${!comodo.isEditing ? 'bg-gray-100' : ''}`} readOnly={!comodo.isEditing} required />
                <input type="number" value={item.qt} onChange={(e) => dispatch({ type: 'UPDATE_ITEM', payload: { comodoId: comodo.id, itemId: item.id, campo: 'qt', value: parseInt(e.target.value) || 0 } })} placeholder="Qt" min="1" className={`w-20 p-2 border rounded-md ${!comodo.isEditing ? 'bg-gray-100' : ''}`} readOnly={!comodo.isEditing} required />
                {comodo.isEditing && (<button type="button" onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { comodoId: comodo.id, itemId: item.id } })} className="text-gray-400 hover:text-red-600 p-1"><FaTrash /></button>)}
            </div>
        ))}
        {comodo.isEditing && (<button type="button" onClick={() => dispatch({ type: 'ADD_ITEM', payload: { comodoId: comodo.id } })} className="text-brand-blue font-semibold text-sm flex items-center mt-2"><FaPlus className="mr-1" /> Adicionar Item</button>)}
    </div>
);

// --- COMPONENTE PRINCIPAL (Orquestrador) ---
const SolicitarMudanca = () => {
    const navigate = useNavigate();
    const { solicitarNovaMudanca, loading, error } = useMudanca();
    const [state, dispatch] = useReducer(mudancaFormReducer, initialState);
    const { comodos, servicosAdicionais, origem, destino } = state;

    const [isPetModalOpen, setIsPetModalOpen] = useState(false);
    const [isVeiculoModalOpen, setIsVeiculoModalOpen] = useState(false);

    const { totalComodos, totalItens, estimativaCaixas, estimativaSacos } = useMemo(() => {
        const itensCount = comodos.reduce((total, comodo) => total + comodo.itens.reduce((soma, item) => soma + (item.qt || 0), 0), 0);
        return { totalComodos: comodos.length, totalItens: itensCount, estimativaCaixas: Math.ceil(itensCount / 5) || 0, estimativaSacos: Math.ceil(itensCount / 3) || 0 };
    }, [comodos]);

    const handleCepBlur = async (tipo) => {
        const cep = state[tipo].cep.replace(/\D/g, '');
        if (cep.length !== 8) return;
        try {
            const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (!data.erro) dispatch({ type: 'UPDATE_ENDERECO_CEP', payload: { tipoCep: tipo, data } });
        } catch (err) { console.error("Erro ao buscar CEP:", err); }
    };
    
    const handleServicoChange = (e) => {
        const { name, checked } = e.target;
        if (name === 'pet') { if (checked) setIsPetModalOpen(true); else dispatch({ type: 'UPDATE_SERVICO_ADICIONAL', payload: { serviceName: 'pet', isChecked: false }}); } 
        else if (name === 'veiculo') { if (checked) setIsVeiculoModalOpen(true); else dispatch({ type: 'UPDATE_SERVICO_ADICIONAL', payload: { serviceName: 'veiculo', isChecked: false }}); } 
        else { dispatch({ type: 'UPDATE_SERVICO_ADICIONAL', payload: { serviceName: name, isChecked: checked }}); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = { ...state, comodos: state.comodos.map(({ isEditing, ...restoDoComodo }) => restoDoComodo) };
        const { success } = await solicitarNovaMudanca(dataToSubmit);
        if (success) { alert("Solicitação enviada com sucesso!"); navigate('/cliente/dashboard'); }
    };

    return (
        <>
            <PetFormModal isOpen={isPetModalOpen} onClose={() => setIsPetModalOpen(false)} onSave={(data) => dispatch({ type: 'UPDATE_SERVICO_ADICIONAL', payload: { serviceName: 'pet', isChecked: true, dataValue: data } })} />
            <VeiculoFormModal isOpen={isVeiculoModalOpen} onClose={() => setIsVeiculoModalOpen(false)} onSave={(data) => dispatch({ type: 'UPDATE_SERVICO_ADICIONAL', payload: { serviceName: 'veiculo', isChecked: true, dataValue: data } })} />
            
            <div className="p-4 md:p-8 bg-brand-background min-h-screen">
                <h1 className="text-3xl font-bold mb-6 text-brand-text-primary text-center">Solicitar Minha Mudança</h1>
                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                    {/* Seções do Formulário */}
                    {/* ... O JSX para as seções 1, 3 e 4 permanecem visualmente os mesmos, mas agora usam os dados do `state` e o `dispatch` */}
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">1. Endereços</h2>
                        <div className="space-y-6">
                            <CampoEndereco tipo="origem" dados={origem} onChange={(e) => dispatch({ type: 'UPDATE_ENDERECO', payload: { tipo: 'origem', name: e.target.name, value: e.target.value } })} onCepBlur={() => handleCepBlur('origem')} />
                            <hr/>
                            <CampoEndereco tipo="destino" dados={destino} onChange={(e) => dispatch({ type: 'UPDATE_ENDERECO', payload: { tipo: 'destino', name: e.target.name, value: e.target.value } })} onCepBlur={() => handleCepBlur('destino')} />
                        </div>
                    </div>
                    
                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">2. Detalhes da Mudança</h2>
                        <div className="space-y-4">
                            {comodos.map(comodo => (<ComodoCard key={comodo.id} comodo={comodo} dispatch={dispatch} isCustom={comodo.isCustom} />))}
                        </div>
                        <button type="button" onClick={() => dispatch({ type: 'ADD_COMODO' })} className="mt-4 text-brand-blue font-semibold flex items-center justify-center w-full p-2 hover:bg-blue-50 rounded-md"><FaPlus className="mr-2" /> Adicionar Outro Cômodo</button>
                    </div>

                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">3. Serviços Adicionais</h2>
                        <div className="space-y-4">
                            <CheckboxServico id="empacotamento" name="empacotamento" label="Preciso do serviço de empacotamento" Icon={FaBoxOpen} checked={servicosAdicionais.empacotamento} onChange={handleServicoChange} />
                            <CheckboxServico id="pet" name="pet" label="Preciso transportar um Pet" Icon={FaPaw} checked={!!servicosAdicionais.pet} onChange={handleServicoChange} />
                            <CheckboxServico id="veiculo" name="veiculo" label="Preciso transportar um Veículo (moto/carro)" Icon={FaMotorcycle} checked={!!servicosAdicionais.veiculo} onChange={handleServicoChange} />
                            {servicosAdicionais.veiculo && (<div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200 text-sm"> Veículo: {servicosAdicionais.veiculo.tipo} - {servicosAdicionais.veiculo.modelo} (Qtd: {servicosAdicionais.veiculo.quantidade})</div>)}
                            {servicosAdicionais.pet && (<div className="mt-2 p-3 bg-yellow-50 rounded-md border border-yellow-200 text-sm"> Pet: {servicosAdicionais.pet.raca} (Qtd: {servicosAdicionais.pet.quantidade}, Tamanho: {servicosAdicionais.pet.tamanho}) - {servicosAdicionais.pet.possuiGaiola ? 'Possui gaiola' : 'Não possui gaiola'}</div>)}
                        </div>
                    </div>

                    <div className="bg-brand-surface p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-center">4. Resumo da Mudança</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-white p-4 rounded-md shadow-sm"><FaHome className="mx-auto text-2xl text-brand-blue mb-2"/><h3 className="font-semibold text-gray-600">Total de Cômodos</h3><p className="text-2xl font-bold text-gray-800">{totalComodos}</p></div>
                            <div className="bg-white p-4 rounded-md shadow-sm"><FaListOl className="mx-auto text-2xl text-brand-blue mb-2"/><h3 className="font-semibold text-gray-600">Total de Itens</h3><p className="text-2xl font-bold text-gray-800">{totalItens}</p></div>
                            <div className="bg-white p-4 rounded-md shadow-sm"><h3 className="font-semibold text-gray-600">Estimativa de Caixas</h3><p className="text-2xl font-bold text-gray-800">{estimativaCaixas}</p></div>
                            <div className="bg-white p-4 rounded-md shadow-sm"><h3 className="font-semibold text-gray-600">Estimativa de Sacolas</h3><p className="text-2xl font-bold text-gray-800">{estimativaSacos}</p></div>
                        </div>
                    </div>

                    {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><span className="block sm:inline">{error}</span></div>)}
                    <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center hover:bg-green-700 disabled:bg-gray-400 transition-colors"><FaPaperPlane className="mr-3" />{loading ? 'Enviando...' : 'Enviar Solicitação'}</button>
                </form>
            </div>
        </>
    );
};

// --- Re-exportando sub-componentes se fossem movidos para arquivos separados ---
// (Mantidos aqui para manter um único arquivo conforme a solicitação)
const CampoEndereco = ({ tipo, dados, onChange, onCepBlur }) => (
    <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3 text-center">{tipo === 'origem' ? 'Endereço de Origem' : 'Endereço de Destino'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" name="cep" value={dados.cep} onChange={onChange} onBlur={onCepBlur} placeholder="CEP" className="p-2 border rounded-md md:col-span-1" required />
            <input type="text" name="cidade" value={dados.cidade} placeholder="Cidade" className="p-2 border rounded-md md:col-span-3 bg-gray-100" readOnly />
            <input type="text" name="bairro" value={dados.bairro} placeholder="Bairro" className="p-2 border rounded-md md:col-span-2 bg-gray-100" readOnly />
            <input type="text" name="rua" value={dados.rua} placeholder="Rua" className="p-2 border rounded-md md:col-span-2 bg-gray-100" readOnly />
            <input type="text" name="numero" value={dados.numero} onChange={onChange} placeholder="Número" className="p-2 border rounded-md md:col-span-2" required />
            <textarea name="referencia" value={dados.referencia} onChange={onChange} placeholder="Referência" rows="2" className="p-2 border rounded-md md:col-span-4"></textarea>
        </div>
    </div>
);
const CheckboxServico = ({ id, name, label, Icon, checked, onChange }) => (
    <div className="flex items-center">
        <input id={id} name={name} type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" />
        <label htmlFor={id} className="ml-3 flex items-center text-md text-gray-700 cursor-pointer"><Icon className="mr-2 text-brand-blue" /><span>{label}</span></label>
    </div>
);


export default SolicitarMudanca;