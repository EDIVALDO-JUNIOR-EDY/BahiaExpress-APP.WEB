// C:/dev/frontend/src/pages/Login.jsx
// VERSÃO FINAL CORRIGIDA E APRIMORADA - Protocolo DEV.SENIOR

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Importa o useLocation
import api from '../services/api';
import { auth } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const GoogleIcon = () => ( <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"> ... </svg> ); // Omitido por brevidade

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, setCurrentUser } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        if (currentUser) {
            const redirectPath = currentUser.userType === 'cliente' ? '/cliente/dashboard' : '/motorista/dashboard';
            navigate(redirectPath);
        }
    }, [currentUser, navigate]);

    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: '', password: '' };
        if (!formData.email) { newErrors.email = 'Email é obrigatório'; isValid = false; } 
        else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = 'Email inválido'; isValid = false; }
        if (!formData.password) { newErrors.password = 'Senha é obrigatória'; isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    const handleSuccessfulLogin = (userData, token) => {
        localStorage.setItem('authToken', token);
        setCurrentUser(userData);
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await api.post('/auth/login', formData);
            handleSuccessfulLogin(response.data.user, response.data.idToken);
        } catch (err) {
            console.error('Erro no login:', err);
            const errorMessage = err.response?.data?.message || 'Falha no login. Verifique suas credenciais.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            const response = await api.post('/auth/google-login', { idToken });
            handleSuccessfulLogin(response.data.user, idToken);
        } catch (err) {
            console.error('Erro no login com Google:', err);
            const errorMessage = err.response?.data?.message || 'Falha ao fazer login com o Google.';
            setError(errorMessage);
        } finally {
            setGoogleLoading(false);
        }
    };

    // --- CORREÇÃO CRÍTICA 1: Implementação da função handleChange ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    if (currentUser) {
        return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-blue-600"><LoadingSpinner /></div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-blue-600">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Entrar na BahiaExpress</h2>
                
                {successMessage && (<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{successMessage}</span></div>)}
                {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>)}
                
                <form onSubmit={handleEmailLogin}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`} placeholder="Seu email" required />
                        {errors.email && (<p className="text-red-500 text-xs italic mt-1">{errors.email}</p>)}
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
                        <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`} placeholder="Sua senha" required />
                        {errors.password && (<p className="text-red-500 text-xs italic mt-1">{errors.password}</p>)}
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <button type="button" onClick={() => navigate('/forgot-password')} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">Esqueceu a senha?</button>
                    </div>
                    <div className="mb-4">
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>
                </form>
                
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">ou continue com</span></div>
                </div>
                
                <button onClick={handleGoogleLogin} disabled={googleLoading} className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    {googleLoading ? 'Conectando...' : <><GoogleIcon /> Entrar com Google</>}
                </button>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Não tem uma conta?{' '}
                        {/* --- CORREÇÃO CRÍTICA 2: Rota de navegação corrigida --- */}
                        <button
                            onClick={() => navigate('/register')}
                            className="font-bold text-blue-500 hover:text-blue-800"
                        >
                            Registre-se
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;