// C:/dev/frontend/src/components/shared/ComodoEditavel.jsx
import React, { useState } from 'react';
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const ComodoEditavel = ({ 
    comodo, 
    onComodoChange, 
    onItemChange, 
    onRemoveItem, 
    onAddItem, 
    onRemoveComodo,
    editando,
    setEditando 
}) => {
    const [tempNome, setTempNome] = useState(comodo.nome);
    const [tempItens, setTempItens] = useState(comodo.itens);

    const handleSave = () => {
        onComodoChange(comodo.id, tempNome);
        setEditando(false);
    };

    const handleCancel = () => {
        setTempNome(comodo.nome);
        setTempItens(comodo.itens);
        setEditando(false);
    };

    const handleAddItem = () => {
        const newItem = {
            id: Date.now(),
            nome: '',
            qt: 1
        };
        setTempItens([...tempItens, newItem]);
    };

    const handleRemoveItem = (itemId) => {
        if (tempItens.length > 1) {
            setTempItens(tempItens.filter(item => item.id !== itemId));
        }
    };

    const handleItemChange = (itemId, campo, valor) => {
        setTempItens(tempItens.map(item => 
            item.id === itemId ? { ...item, [campo]: valor } : item
        ));
    };

    return (
        <div className="border p-4 rounded-md space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
                {editando ? (
                    <input
                        type="text"
                        value={tempNome}
                        onChange={(e) => setTempNome(e.target.value)}
                        className="font-semibold text-lg border-b-2 border-transparent focus:border-brand-blue focus:outline-none bg-transparent w-full"
                        placeholder="Nome do cômodo"
                    />
                ) : (
                    <h3 className="font-semibold text-lg">{tempNome}</h3>
                )}
                
                <div className="flex gap-2">
                    {editando ? (
                        <>
                            <button 
                                type="button" 
                                onClick={handleSave}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Salvar"
                            >
                                <FaSave />
                            </button>
                            <button 
                                type="button" 
                                onClick={handleCancel}
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
            
            {tempItens.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={item.nome} 
                        onChange={(e) => handleItemChange(item.id, 'nome', e.target.value)} 
                        placeholder={`Item ${index + 1}`} 
                        className="flex-grow p-2 border rounded-md"
                        aria-label={`Nome do item ${index + 1}`}
                        required
                    />
                    <input 
                        type="number" 
                        value={item.qt} 
                        onChange={(e) => handleItemChange(item.id, 'qt', e.target.value)} 
                        placeholder="Qt" 
                        min="1" 
                        className="w-20 p-2 border rounded-md"
                        aria-label="Quantidade"
                        required
                    />
                    {editando && tempItens.length > 1 && (
                        <button 
                            type="button" 
                            onClick={() => handleRemoveItem(item.id)} 
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
                    onClick={handleAddItem} 
                    className="text-brand-blue font-semibold text-sm flex items-center"
                >
                    <FaPlus className="mr-1" aria-hidden="true" /> Adicionar Item
                </button>
            )}
        </div>
    );
};

export default ComodoEditavel;