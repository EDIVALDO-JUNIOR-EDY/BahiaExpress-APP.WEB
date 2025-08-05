// C:/dev/backend/middleware/authMiddleware.js
// VERSÃO 3.5 - APRIMORADA COM VALIDAÇÕES COMPLETAS - Protocolo DEV.SENIOR
const { auth, db } = require('../firebaseConfig');

/**
 * Middleware de Autenticação Aprimorado
 * 
 * Funcionalidades:
 * - Verificação de token JWT
 * - Busca de dados completos do usuário no Firestore
 * - Validação de status ativo e e-mail verificado
 * - Logs detalhados para diagnóstico (Lei nº 5)
 * - Tratamento de erros específicos (Lei nº 13)
 */
const protect = async (req, res, next) => {
  console.log(`🔍 [AuthMiddleware] Iniciando verificação de autenticação`);
  
  // 1. Verificar se o token foi fornecido
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`❌ [AuthMiddleware] Token não fornecido ou formato inválido`);
    return res.status(401).json({ 
      success: false, 
      message: 'Token não fornecido ou em formato inválido.' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // 2. Verificar o token com Firebase Admin
    console.log(`[AuthMiddleware] Verificando token...`);
    const decodedToken = await auth.verifyIdToken(token);
    console.log(`✅ [AuthMiddleware] Token válido para: ${decodedToken.email}`);
    
    // 3. Buscar dados completos do usuário no Firestore
    console.log(`[AuthMiddleware] Buscando dados do usuário no Firestore...`);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      console.log(`❌ [AuthMiddleware] Usuário não encontrado no Firestore: ${decodedToken.uid}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado.' 
      });
    }
    
    const userData = userDoc.data();
    
    // 4. Validar status do usuário
    if (userData.status !== 'active') {
      console.log(`❌ [AuthMiddleware] Usuário inativo: ${decodedToken.email}`);
      return res.status(403).json({ 
        success: false, 
        message: 'Usuário inativo. Entre em contato com o suporte.' 
      });
    }
    
    // 5. Validar e-mail verificado
    if (!userData.emailVerified) {
      console.log(`❌ [AuthMiddleware] E-mail não verificado: ${decodedToken.email}`);
      return res.status(403).json({ 
        success: false, 
        message: 'E-mail não verificado. Verifique seu e-mail antes de continuar.' 
      });
    }
    
    // 6. Anexar dados completos do usuário à requisição
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userData // Inclui todos os dados do Firestore
    };
    
    console.log(`✅ [AuthMiddleware] Autenticação bem-sucedida para: ${decodedToken.email}`);
    console.log(`✅ [AuthMiddleware] Dados do usuário:`, {
      uid: req.user.uid,
      email: req.user.email,
      userType: req.user.userType,
      status: req.user.status,
      emailVerified: req.user.emailVerified
    });
    
    next();
    
  } catch (error) {
    console.error(`❌ [AuthMiddleware] Erro na verificação do token:`, error.message);
    
    // Tratamento específico para erros comuns
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado. Faça login novamente.' 
      });
    }
    
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido.' 
      });
    }
    
    // Erro genérico
    return res.status(401).json({ 
      success: false, 
      message: 'Falha na autenticação. Tente novamente.' 
    });
  }
};

module.exports = { protect };