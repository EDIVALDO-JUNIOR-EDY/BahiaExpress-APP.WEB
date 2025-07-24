// CÓDIGO PARA backend/middleware/authMiddleware.js

const { auth } = require('../firebaseConfig');

const verifyAuthToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).send({ error: 'Nenhum token fornecido. Acesso não autorizado.' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken; // Adiciona os dados do usuário à requisição
    next(); // Permite que a requisição continue para a rota
  } catch (error) {
    return res.status(403).send({ error: 'Token inválido ou expirado.' });
  }
};

module.exports = { verifyAuthToken };