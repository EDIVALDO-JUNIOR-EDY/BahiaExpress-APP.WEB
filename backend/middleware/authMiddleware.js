const { auth } = require('../firebaseConfig');

/**
 * Middleware para proteger rotas, implementando Autenticação e Autorização.
 * 1. Autenticação: Verifica se o token JWT/Firebase é válido.
 * 2. Autorização: Verifica se o usuário autenticado possui a 'role' necessária.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split('Bearer ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Token ausente. Acesso não autorizado.' });
      }

      // --- ETAPA DE AUTENTICAÇÃO ---
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      
      // --- ETAPA DE AUTORIZAÇÃO (A LÓGICA QUE FALTAVA) ---
      // Verificamos se o usuário tem uma das roles permitidas.
      const authorizedRoles = ['user', 'admin']; // Defina aqui as roles que têm acesso
      if (!decodedToken.role || !authorizedRoles.includes(decodedToken.role)) {
        // Se o usuário não tem role ou a role dele não está na lista, bloqueamos o acesso.
        return res.status(403).json({ message: 'Permissão negada. Role não autorizada.' });
      }
      
      // Se passou pela autenticação e autorização, continue.
      next();
    
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido ou expirado. Autenticação falhou.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido. Acesso não autorizado.' });
  }
};

module.exports = { protect };