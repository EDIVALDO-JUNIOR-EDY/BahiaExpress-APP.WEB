// C:/dev/frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { auth } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Componente do Ícone do Google
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
);

// Componente Principal de Login
const Login = () => {
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Efeito de redirecionamento automático
    useEffect(() => {
        if (currentUser) {
            console.log('[Login Page] Usuário já logado. Redirecionando para o dashboard...');
            const redirectPath = currentUser.userType === 'cliente' 
                ? '/cliente/dashboard' 
                : (currentUser.userType === 'motorista' || currentUser.userType === 'empresa')
                    ? '/motorista/dashboard'
                    : '/';
            
            navigate(redirectPath);
        }
    }, [currentUser, navigate]);

    // Validação do formulário
    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: '', password: '' };

        // Validação do email
        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
            isValid = false;
        }

        // Validação da senha
        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Manipulador de login bem-sucedido
    const handleSuccessfulLogin = (userData, token) => {
        localStorage.setItem('authToken', token);
        setCurrentUser(userData);
    };

    // Login com email e senha
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', formData);
            const { user, idToken } = response.data;
            
            if (response.data.success) {
                handleSuccessfulLogin(user, idToken);
            } else {
                setError(response.data.message || 'Falha no login');
                setLoading(false);
            }
        } catch (err) {
            console.error('Erro no login:', err);
            const errorMessage = err.response?.data?.message || 'Falha no login. Verifique suas credenciais.';
            
            // Tratamento específico para email não verificado
            if (err.response?.data?.emailNotVerified) {
                setError('Por favor, verifique seu email antes de fazer login.');
            } else {
                setError(errorMessage);
            }
            
            setLoading(false);
        }
    };

    // Login com Google
    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            
            const response = await api.post('/auth/google-login', { idToken });
            const { user } = response.data;
            
            if (response.data.success) {
                handleSuccessfulLogin(user, idToken);
            } else {
                setError(response.data.message || 'Falha no login com Google');
                setGoogleLoading(false);
            }
        } catch (err) {
            console.error('Erro no login com Google:', err);
            const errorMessage = err.response?.data?.message || 'Falha ao fazer login com o Google.';
            setError(errorMessage);
            setGoogleLoading(false);
        }
    };

    // Manipulador de mudança de campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpar erro do campo quando o usuário começa a digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Se já estiver logado, mostrar loading
    if (currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-blue-600">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-blue-600">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Entrar na BahiaExpress</h2>
                
                {/* Mensagem de erro geral */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                <form onSubmit={handleEmailLogin}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                                errors.email ? 'border-red-500' : ''
                            }`}
                            placeholder="Seu email"
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>
                        )}
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                                errors.password ? 'border-red-500' : ''
                            }`}
                            placeholder="Sua senha"
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        >
                            Esqueceu a senha?
                        </button>
                    </div>
                    
                    <div className="mb-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Entrando...
                                </span>
                            ) : 'Entrar'}
                        </button>
                    </div>
                </form>
                
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">ou continue com</span>
                    </div>
                </div>
                
                <button
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {googleLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Conectando...
                        </span>
                    ) : (
                        <>
                            <GoogleIcon />
                            Entrar com Google
                        </>
                    )}
                </button>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Não tem uma conta?{' '}
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