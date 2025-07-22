import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; // <-- MUDANÇA AQUI

const MeuPerfil = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [tipoVeiculo, setTipoVeiculo] = useState('');
    
    useEffect(() => {
        if (currentUser) {
            // MUDANÇA AQUI:
            api.get(`/perfil/meu-perfil/${currentUser.uid}`)
                .then(response => {
                    const perfil = response.data;
                    setNome(perfil.nome || '');
                    setTelefone(perfil.telefone || '');
                    if(perfil.userType === 'motorista') {
                        setTipoVeiculo(perfil.tipo_veiculo || '');
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Erro ao carregar dados do perfil", err);
                    setLoading(false);
                });
        }
    }, [currentUser]);

    const handleSalvar = async (e) => {
        e.preventDefault();
        const dadosAtualizados = { nome, telefone };
        if (currentUser.userType === 'motorista') {
            dadosAtualizados.tipo_veiculo = tipoVeiculo;
        }
        try {
            // MUDANÇA AQUI:
            await api.put(`/perfil/meu-perfil/${currentUser.uid}`, dadosAtualizados);
            alert("Perfil atualizado com sucesso!");
            setIsEditing(false);
        } catch (error) {
            alert("Erro ao salvar o perfil.");
            console.error(error);
        }
    };

    if (loading) return <p className="p-8 text-center">Carregando seu perfil...</p>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleSalvar}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Nome Completo</label>
                        <input type="text" value={nome} onChange={e => setNome(e.target.value)} disabled={!isEditing} className="w-full p-2 border rounded bg-gray-100 disabled:bg-gray-200"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Email</label>
                        <input type="email" value={currentUser.email} disabled className="w-full p-2 border rounded bg-gray-200 cursor-not-allowed"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Telefone</label>
                        <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} disabled={!isEditing} className="w-full p-2 border rounded bg-gray-100 disabled:bg-gray-200"/>
                    </div>
                    {currentUser.userType === 'motorista' && (
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2">Tipo de Veículo (ex: Caminhão 3/4, Van)</label>
                            <input type="text" value={tipoVeiculo} onChange={e => setTipoVeiculo(e.target.value)} disabled={!isEditing} className="w-full p-2 border rounded bg-gray-100 disabled:bg-gray-200"/>
                        </div>
                    )}
                    <div className="mt-6 flex justify-end space-x-4">
                        {isEditing ? (
                            <>
                                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Salvar Alterações</button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Editar Perfil</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MeuPerfil;