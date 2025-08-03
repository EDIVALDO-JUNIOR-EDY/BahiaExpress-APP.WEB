// C:/dev/frontend/src/pages/Login.jsx

import React, { useState, useEffect } from 'react'; // 1. Importar useEffect
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { auth } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner'; // Para uma melhor UX

// --- COMPONENTE DO ÍCONE DO GOOGLE (Preservado) ---
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        {/* ... código SVG completo ... */}
    </svg>
);

// --- COMPONENTE PRINCIPAL DE LOGIN (Aprimorado) ---
const Login = () => {
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useAuth(); // 2. Obter o currentUser
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 3. EFEITO DE REDIRECIONAMENTO AUTOMÁTICO
    useEffect(() => {
        // Se o currentUser já foi carregado e existe (ou seja, não é null),
        // significa que o usuário já está logado.
        if (currentUser) {
            console.log('[Login Page] Usuário já logado. Redirecionando para o dashboard...');
            // Redireciona para o dashboard correto com base no tipo de usuário
            if (currentUser.userType === 'cliente') {
                navigate('/cliente/dashboard');
            } else if (currentUser.userType === 'motorista' || currentUser.userType === 'empresa') {
                navigate('/motorista/dashboard');
            } else {
                navigate('/'); // Fallback para a home
            }
        }
    }, [currentUser, navigate]); // Este efeito roda sempre que o currentUser mudar

    const handleSuccessfulLogin = (userData, token) => {
        localStorage.setItem('authToken', token);
        setCurrentUser(userData); // O AuthContext irá atualizar e o useEffect acima fará o resto
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
            setLoading(false);
        }
        // Não precisamos do `finally` aqui, pois o loading só deve parar no erro.
        // No sucesso, a página irá redirecionar.
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
            setLoading(false);
        }
    };
    
    // 4. RENDERIZAÇÃO CONDICIONAL
    // Enquanto o useEffect verifica o estado do usuário, mostramos um loader
    // para evitar que o formulário de login "pisque" na tela para um usuário já logado.
    if (currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <LoadingSpinner />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                {/* ... O seu JSX do formulário permanece exatamente o mesmo aqui ... */}
            </div>
        </div>
    );
};

export default Login;