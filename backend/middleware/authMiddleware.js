// backend/middleware/authMiddleware.js

const { auth } = require('../firebaseConfig');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Não autorizado, token ausente.' });
      }

      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken; // Anexa o usuário à requisição
      next();
    } catch (error) {
      console.error('ERRO NA VERIFICAÇÃO DO TOKEN:', error.message);
      res.status(401).json({ message: 'Não autorizado, token inválido ou expirado.' });
    }
  } else {
    res.status(401).json({ message: 'Não autorizado, token não fornecido ou em formato inválido.' });
  }
};

module.exports = { protect }; // Exportando a função correta