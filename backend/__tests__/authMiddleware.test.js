const request = require('supertest');
const express = require('express');
const { protect } = require('../middleware/authMiddleware'); // Verificamos que este caminho está correto

// Mock do Firebase Admin SDK
// Verificamos que o caminho para o mock também está correto
jest.mock('../firebaseConfig', () => ({
  auth: {
    verifyIdToken: jest.fn((token) => {
      // Simula um token válido com a role 'user'
      if (token === 'valid_token') {
        return Promise.resolve({ uid: '123', role: 'user' });
      } 
      // Simula um token válido mas com uma role não autorizada
      else if (token === 'unauthorized_token') {
        return Promise.resolve({ uid: '456', role: 'guest' });
      } 
      // Simula qualquer outro token como inválido
      else {
        return Promise.reject(new Error('Token inválido fornecido pelo mock'));
      }
    }),
  },
}));

// Cria um app Express temporário apenas para os testes
const app = express();
app.use(express.json());

// Define uma rota protegida que usa nosso middleware real
app.get('/protected', protect, (req, res) => {
  res.status(200).json({ message: 'Acesso autorizado', user: req.user });
});

// Inicia a suíte de testes para o middleware 'protect'
describe('Middleware protect', () => {

  it('deve permitir acesso com um token válido e role autorizada', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid_token');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Acesso autorizado');
    expect(response.body.user.uid).toBe('123');
  });

  it('deve bloquear o acesso com um token inválido', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid_token');
    
    expect(response.statusCode).toBe(401);
  });

  it('deve bloquear o acesso quando o token está ausente', async () => {
    const response = await request(app)
      .get('/protected');
    
    expect(response.statusCode).toBe(401);
  });

  it('deve bloquear o acesso com um token malformado (sem valor)', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer '); // Note o espaço em branco
    
    expect(response.statusCode).toBe(401);
  });

  it('deve bloquear o acesso com uma role não autorizada', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer unauthorized_token');
    
    expect(response.statusCode).toBe(403);
  });
});