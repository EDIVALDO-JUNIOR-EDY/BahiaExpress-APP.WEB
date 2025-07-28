/**
 * Página de registro de usuário.
 * Permite criar conta como cliente, motorista ou empresa.
 *
 * Parâmetros:
 * - email: Email do usuário (string, obrigatório)
 * - password: Senha do usuário (string, obrigatório)
 * - nome: Nome completo do usuário (string, obrigatório)
 * - userType: Tipo de usuário ('cliente', 'motorista', 'empresa'), default 'cliente'
 *
 * Ciclo de registro:
 * 1. Validação dos campos obrigatórios.
 * 2. Requisição POST para /auth/register no backend.
 * 3. Feedback ao usuário (sucesso ou erro).
 * 4. Redirecionamento para login em caso de sucesso.
 *
 * Respostas:
 * - Sucesso: Mostra mensagem do backend, navega para login.
 * - Erro: Mostra mensagem de erro detalhada.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nome, setNome] = useState('');
    const [userType, setUserType] = useState('cliente');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * Função que lida com o envio do formulário de registro.
     * @param {Event} e
     */
    const handleRegister = async (e) => {
        e.preventDefault();
        // Validação dos parâmetros obrigatórios
        if (!email || !password || !nome) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Envia dados para backend
            const response = await api.post('/auth/register', {
                email,
                password,
                nome,
                userType
            });
            // Resposta padronizada: mostra mensagem do backend
            alert(response.data.message);
            navigate('/login');
        } catch (err) {
            // Tratamento detalhado de erro
            setError(
                err.response?.data?.message
                || err.response?.data?.error
                || 'Erro ao registrar. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Criar Conta</h2>
                <form onSubmit={handleRegister} autoComplete="off">
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="nome">Nome Completo</label>
                        <input
                            className="w-full p-3 border rounded-lg"
                            type="text"
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                        <input
                            className="w-full p-3 border rounded-lg"
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">Senha</label>
                        <input
                            className="w-full p-3 border rounded-lg"
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">Tipo de Usuário</label>
                        <select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-white"
                        >
                            <option value="cliente">Sou Cliente (Preciso de mudança)</option>
                            <option value="motorista">Sou Motorista</option>
                            <option value="empresa">Sou uma Empresa</option>
                        </select>
                    </div>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Registrando...' : 'Registrar'}
                    </button>
                </form>
                <p className="text-center mt-4">Já tem uma conta? <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">Faça Login</button></p>
            </div>
        </div>
    );
};

export default Register;