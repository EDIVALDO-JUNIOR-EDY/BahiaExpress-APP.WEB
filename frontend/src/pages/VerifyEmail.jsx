// C:/dev/frontend/src/pages/VerifyEmail.jsx
// VERSÃO 3.0 - PÁGINA DE VERIFICAÇÃO DE E-MAIL - Protocolo DEV.SENIOR
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
      return;
    }

    const verifyEmail = async () => {
      try {
        console.log(`🔍 [Frontend] Enviando token para verificação: ${token}`);
        const response = await api.get(`/auth/verify-email?token=${token}`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
        } else {
          setStatus('error');
          setMessage(response.data.message);
        }
      } catch (error) {
        console.error('❌ [Frontend] Erro na verificação:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Erro ao verificar e-mail.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '20px' }}>
          {status === 'loading' ? 'Verificando E-mail...' : 
           status === 'success' ? '✅ E-mail Verificado!' : 
           '❌ Erro na Verificação'}
        </h1>
        
        <p style={{ 
          color: status === 'success' ? '#28a745' : 
                 status === 'error' ? '#dc3545' : '#666',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          {message}
        </p>
        
        {status === 'success' && (
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              background: 'linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Ir para o Login
          </button>
        )}
        
        {status === 'error' && (
          <div>
            <button 
              onClick={() => window.location.href = '/login'}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Voltar ao Login
            </button>
            <button 
              onClick={() => window.location.href = '/forgot-password'}
              style={{
                background: 'linear-gradient(135deg, #FF8C00 0%, #1E90FF 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Reenviar E-mail
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;