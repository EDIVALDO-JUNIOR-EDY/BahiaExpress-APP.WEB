// CÓDIGO COMPLETO para frontend/src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Verifique seu e-mail para o link de redefinição de senha.');
        } catch (err) {
            setError('Falha ao enviar e-mail. Verifique se o endereço está correto.');
            console.error("Erro na recuperação de senha:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Recuperar Senha</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                        <input
                            className="w-full p-3 border rounded-lg"
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {message && <p className="text-green-500 text-center mb-4">{message}</p>}
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                    </button>
                </form>
                <p className="text-center mt-4">
                    <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">Voltar para o Login</button>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;