// C:/dev/frontend/src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { auth } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

// --- COMPONENTE DO ÍCONE DO GOOGLE (AGORA COMPLETO) ---
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#34A853" d="M43.611 20.083H24v8h11.303c-1.649 4.657-6.08 8-11.303 8V44c5.268 0 10.046-1.947 13.611-5.657l-5.657-5.657z"></path>
        <path fill="#FBBC05" d="M10.219 28.781l5.657 5.657C17.947 36.053 20.732 37 24 37v-8c-3.223 0-6.008-1.053-8.122-2.878z"></path>
        <path fill="#EA4335" d="M24 11c-3.223 0-6.008 1.053-8.122 2.878l-5.657-5.657C13.954 6.053 18.732 4 24 4v7z"></path>
    </svg>
);

// --- COMPONENTE PRINCIPAL DE LOGIN ---
const Login = () => {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSuccessfulLogin = (userData, token) => {
        localStorage.setItem('authToken', token);
        setCurrentUser(userData);
        if (userData.userType === 'cliente') {
            navigate('/cliente/dashboard');
        } else if (userData.userType === 'motorista' || userData.userType === 'empresa') {
            navigate('/motorista/dashboard');
        } else {
            navigate('/');
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, idToken } = response.data;
            handleSuccessfulLogin(user, idToken);
        } catch (err) {
            setError(err.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            const response = await api.post('/auth/google-login', { idToken });
            const { user } = response.data;
            handleSuccessfulLogin(user, idToken);
        } catch (err) {
            setError(err.response?.data?.message || 'Falha ao fazer login com o Google.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Bem-vindo de volta!</h2>
                <p className="text-center text-gray-500 mb-6">Acesse sua conta</p>
                <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-50 mb-4">
                    <GoogleIcon />
                    Entrar com o Google
                </button>
                <div className="flex items-center my-4">
                    <hr className="flex-grow border-t border-gray-300"/>
                    <span className="px-4 text-gray-500">OU</span>
                    <hr className="flex-grow border-t border-gray-300"/>
                </div>
                <form onSubmit={handleEmailLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                        <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                            <label className="block text-gray-700 mb-2" htmlFor="password">Senha</label>
                            <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-blue-600 hover:underline">Esqueceu a senha?</button>
                        </div>
                        <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <p className="text-center mt-4">Não tem uma conta? <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline">Registre-se</button></p>
            </div>
        </div>
    );
};

export default Login;