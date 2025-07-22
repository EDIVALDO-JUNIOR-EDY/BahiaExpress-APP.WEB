import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importa a função de login do Firebase
import { auth, db } from '../services/firebase'; // Importa nossa configuração do Firebase
import { doc, getDoc } from 'firebase/firestore'; // Para buscar dados do usuário

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Usa a função do Firebase para fazer o login
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Busca o tipo de usuário no Firestore para saber para onde redirecionar
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.userType === 'cliente') {
                    navigate('/cliente/solicitar-mudanca');
                } else if (userData.userType === 'motorista' || userData.userType === 'empresa') {
                    navigate('/motorista/dashboard');
                } else {
                    navigate('/'); // Fallback para a home
                }
            } else {
                 setError('Dados do usuário não encontrados.');
            }

        } catch (err) {
            setError('Email ou senha inválidos. Verifique e tente novamente.');
            console.error("Erro de login:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                        <input className="w-full p-3 border rounded-lg" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2" htmlFor="password">Senha</label>
                        <input className="w-full p-3 border rounded-lg" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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