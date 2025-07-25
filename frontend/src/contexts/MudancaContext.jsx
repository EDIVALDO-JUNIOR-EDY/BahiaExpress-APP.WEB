// CÓDIGO COMPLETO para frontend/src/contexts/MudancaContext.jsx

import React, { createContext, useState, useContext } from 'react';
import api from '../services/api'; // Importando sua instância centralizada do Axios

// Cria o contexto
const MudancaContext = createContext();

// Cria o Provedor, que é o componente que vai "segurar" e fornecer os dados
export const MudancaProvider = ({ children }) => {
    const [mudancas, setMudancas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Função para um cliente solicitar uma nova mudança
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

    // Função para buscar as mudanças de um usuário (seja cliente ou motorista)
    // O backend saberá quem é o usuário pelo token de autenticação
    const buscarMinhasMudancas = async (userType) => {
        setLoading(true);
        setError(null);
        try {
            // A rota no backend precisa ser ajustada para receber o tipo de usuário
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
    
    // Futuramente, adicionaremos mais funções aqui (buscarFretesDisponiveis, aceitarMudanca, etc.)

    // O valor que será compartilhado com todos os componentes "filhos"
    const value = {
        mudancas,
        loading,
        error,
        solicitarNovaMudanca,
        buscarMinhasMudancas,
    };

    return (
        <MudancaContext.Provider value={value}>
            {children}
        </MudancaContext.Provider>
    );
};

// Hook customizado para facilitar o uso do contexto em outros componentes
export const useMudanca = () => {
    const context = useContext(MudancaContext);
    if (context === undefined) {
        throw new Error('useMudanca deve ser usado dentro de um MudancaProvider');
    }
    return context;
};