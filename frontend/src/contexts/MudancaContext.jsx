// CÓDIGO COMPLETO E EXPANDIDO para frontend/src/contexts/MudancaContext.jsx

import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';

const MudancaContext = createContext();

export const MudancaProvider = ({ children }) => {
    // Estado para as mudanças do usuário logado (cliente ou motorista)
    const [mudancas, setMudancas] = useState([]);
    // NOVO: Estado separado para a lista de fretes disponíveis para motoristas
    const [fretesDisponiveis, setFretesDisponiveis] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Função para um cliente solicitar uma nova mudança (sem alterações)
    const solicitarNovaMudanca = async (dadosDaMudanca) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/mudancas/criar', dadosDaMudanca);
            return { success: true, data };
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao solicitar mudança.');
            return { success: false, error: err.response?.data?.message || 'Erro desconhecido' };
        } finally {
            setLoading(false);
        }
    };

    // Função para buscar as mudanças do usuário logado (sem alterações)
    const buscarMinhasMudancas = async (userType) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/mudancas/minhas/${userType}`);
            setMudancas(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao buscar suas mudanças.');
            return [];
        } finally {
            setLoading(false);
        }
    };
    
    // --- NOVAS FUNÇÕES PARA O MOTORISTA ---

    // 1. Função para buscar todos os fretes com status 'disponivel'
    const buscarFretesDisponiveis = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/mudancas/disponiveis');
            setFretesDisponiveis(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao buscar fretes disponíveis.');
        } finally {
            setLoading(false);
        }
    };

    // 2. Função para um motorista aceitar um frete
    const aceitarFrete = async (mudancaId) => {
        setLoading(true);
        setError(null);
        try {
            await api.post(`/mudancas/${mudancaId}/aceitar`);
            // Remove o frete da lista local para atualizar a UI imediatamente
            setFretesDisponiveis(prev => prev.filter(f => f.id !== mudancaId));
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao aceitar o frete.');
            return { success: false, error: err.response?.data?.message || 'Erro desconhecido' };
        } finally {
            setLoading(false);
        }
    };

    // O valor compartilhado com a aplicação, agora com as novas funções e estado
    const value = {
        mudancas,
        fretesDisponiveis, // Adicionado
        loading,
        error,
        solicitarNovaMudanca,
        buscarMinhasMudancas,
        buscarFretesDisponiveis, // Adicionado
        aceitarFrete,             // Adicionado
    };

    return (
        <MudancaContext.Provider value={value}>
            {children}
        </MudancaContext.Provider>
    );
};

// Hook customizado (sem alterações)
export const useMudanca = () => {
    const context = useContext(MudancaContext);
    if (context === undefined) {
        throw new Error('useMudanca deve ser usado dentro de um MudancaProvider');
    }
    return context;
};