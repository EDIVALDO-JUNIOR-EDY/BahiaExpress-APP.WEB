// C:/dev/frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/cliente/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      console.log('Google Login Success:', response);
      await googleLogin(response.credential);
      navigate('/cliente/dashboard');
    } catch (err) {
      console.error('Google Login Error:', err);
      setError('Falha no login com Google');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 to-blue-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="E-mail"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <input
              type="password"
              placeholder="Senha"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Entrar
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">Ou entre com:</p>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Login com Google falhou')}
            />
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-blue-500 hover:underline">
            Esqueceu sua senha?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;