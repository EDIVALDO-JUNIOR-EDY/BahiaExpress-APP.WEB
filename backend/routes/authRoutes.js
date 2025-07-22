const express = require('express');
const { auth, db } = require('../firebaseConfig');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, userType, nome, telefone, ...otherData } = req.body;
  if (!email || !password || !userType || !nome) {
    return res.status(400).send({ message: 'Campos essenciais (email, senha, tipo, nome) são obrigatórios.' });
  }
  try {
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: nome,
      disabled: false,
    });
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      userType,
      nome,
      telefone: telefone || null,
      createdAt: new Date(),
      ...otherData
    });
    res.status(201).send({ message: 'Usuário registrado com sucesso!', uid: userRecord.uid });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).send({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

module.exports = router;
