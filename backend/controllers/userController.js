const { auth, db } = require('../firebaseConfig');

/**
 * Buscar perfil do usuário autenticado.
 * GET /api/users/me
 */
exports.getOwnProfile = async (req, res) => {
  const uid = req.user.uid;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: 'Usuário não encontrado.' });
    return res.json(doc.data());
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ message: 'Erro ao buscar perfil.' });
  }
};

/**
 * Atualizar perfil do usuário autenticado.
 * PUT /api/users/me
 */
exports.updateOwnProfile = async (req, res) => {
  const uid = req.user.uid;
  const updateData = { ...req.body };
  delete updateData.uid;
  try {
    await db.collection('users').doc(uid).update(updateData);
    return res.json({ message: 'Perfil atualizado com sucesso.' });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
};

/**
 * Excluir usuário autenticado.
 * DELETE /api/users/me
 */
exports.deleteOwnAccount = async (req, res) => {
  const uid = req.user.uid;
  try {
    await auth.deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    return res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return res.status(500).json({ message: 'Erro ao excluir usuário.' });
  }
};

/**
 * Buscar perfil público de qualquer usuário pelo UID (ex: para avaliação).
 * GET /api/users/:uid
 */
exports.getPublicProfile = async (req, res) => {
  const { uid } = req.params;
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: 'Usuário não encontrado.' });
    const data = doc.data();
    delete data.email;
    delete data.telefone;
    return res.json(data);
  } catch (error) {
    console.error("Erro ao buscar perfil público:", error);
    return res.status(500).json({ message: 'Erro ao buscar perfil público.' });
  }
};