const express = require('express');
const PDFDocument = require('pdfkit');
const { db } = require('../firebaseConfig');
const router = express.Router();

router.get('/gerar/:mudancaId', async (req, res) => {
  const { mudancaId } = req.params;
  try {
    const mudancaDoc = await db.collection('mudancas').doc(mudancaId).get();
    if (!mudancaDoc.exists)
      return res.status(404).send({ message: 'Mudança não encontrada.' });
    const mudancaData = mudancaDoc.data();
    const clienteDoc = await db.collection('users').doc(mudancaData.clienteId).get();
    const motoristaDoc = await db.collection('users').doc(mudancaData.motoristaId).get();
    if (!clienteDoc.exists || !motoristaDoc.exists)
      return res.status(404).send({ message: 'Cliente ou Motorista não encontrados.' });
    const clienteData = clienteDoc.data();
    const motoristaData = motoristaDoc.data();
    const clienteAssinou = req.query.clienteAssinou === 'true';
    const motoristaAssinou = req.query.motoristaAssinou === 'true';
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(20)
      .text('Contrato de Prestação de Serviço - BahiaExpress', { align: 'center' })
      .moveDown();
    doc.fontSize(12)
      .text(`Contrato ID: ${mudancaId}`)
      .text(`Data: ${new Date().toLocaleDateString('pt-BR')}`)
      .moveDown();
    doc.fontSize(14).text('Partes Contratantes:', { underline: true });
    doc.fontSize(12)
      .text(`CLIENTE: ${clienteData.nome}, Email: ${clienteData.email}`)
      .text(`MOTORISTA: ${motoristaData.nome}, Email: ${motoristaData.email}`)
      .moveDown();
    doc.fontSize(14).text('Objeto:', { underline: true });
    doc.fontSize(12)
      .text(`Serviço de mudança de ${mudancaData.origem} para ${mudancaData.destino}.`)
      .moveDown();
    const valorFinal = mudancaData.negociacao?.propostaMotorista || mudancaData.valorPropostoCliente;
    doc.fontSize(14).text('Valor Acordado:', { underline: true });
    doc.fontSize(12)
      .text(`R$ ${valorFinal}`)
      .moveDown();
    doc.fontSize(14).text('Cláusulas de Responsabilidade:', { underline: true });
    doc.fontSize(12).list([
      'O CONTRATADO (Motorista) se responsabiliza por 100% de danos aos itens durante o transporte (trajeto no veículo).',
      'Danos durante o carregamento/descarregamento serão de responsabilidade dividida entre o CONTRATADO e sua equipe de ajudantes.',
      'O CONTRATANTE deve declarar itens frágeis e de alto valor.'
    ]).moveDown(2);
    doc.fontSize(14).text('Assinaturas Digitais:', { underline: true }).moveDown();
    doc.text(`Assinatura Cliente: ${clienteAssinou ? `Assinado por ${clienteData.nome}` : 'Pendente'}`).moveDown();
    doc.text(`Assinatura Motorista: ${motoristaAssinou ? `Assinado por ${motoristaData.nome}` : 'Pendente'}`);

    doc.end();
  } catch (error) {
    console.error("Erro ao gerar contrato:", error);
    res.status(500).send({ message: 'Erro ao gerar contrato', error: error.message });
  }
});

module.exports = router;
