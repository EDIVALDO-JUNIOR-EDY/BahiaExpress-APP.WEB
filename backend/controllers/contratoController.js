// backend/controllers/contratoController.js

const PDFDocument = require('pdfkit');
const { db } = require('../firebaseConfig');

exports.gerarContratoPDF = async (req, res) => {
  const { mudancaId } = req.params;
  try {
    const mudancaDoc = await db.collection('mudancas').doc(mudancaId).get();
    if (!mudancaDoc.exists) return res.status(404).send({ message: 'Mudança não encontrada.' });
    const mudancaData = mudancaDoc.data();
    if (!mudancaData.motoristaId) return res.status(400).send({ message: 'Contrato não pode ser gerado antes de um motorista aceitar o frete.' });
    const clienteDoc = await db.collection('users').doc(mudancaData.clienteId).get();
    const motoristaDoc = await db.collection('users').doc(mudancaData.motoristaId).get();
    if (!clienteDoc.exists || !motoristaDoc.exists) return res.status(404).send({ message: 'Dados do Cliente ou do Motorista não encontrados.' });
    const clienteData = clienteDoc.data();
    const motoristaData = motoristaDoc.data();
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="contrato_${mudancaId}.pdf"`);
    doc.pipe(res);
    doc.fontSize(20).text('Contrato de Prestação de Serviço - BahiaExpress', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Contrato ID: ${mudancaId}`).text(`Data: ${new Date().toLocaleDateString('pt-BR')}`).moveDown();
    doc.fontSize(14).text('Partes Contratantes:', { underline: true });
    doc.fontSize(12).text(`CONTRATANTE (CLIENTE): ${clienteData.nome}, Email: ${clienteData.email}`).text(`CONTRATADO (MOTORISTA): ${motoristaData.nome}, Email: ${motoristaData.email}`).moveDown();
    const valorFinal = mudancaData.negociacao?.propostaMotorista || mudancaData.valorPropostoCliente || 'Não definido';
    doc.fontSize(14).text('Valor Acordado:', { underline: true });
    doc.fontSize(12).text(`R$ ${valorFinal}`).moveDown();
    doc.fontSize(14).text('Assinaturas Digitais:', { underline: true }).moveDown();
    doc.text(`Assinatura Cliente: Pendente`).moveDown();
    doc.text(`Assinatura Motorista: Pendente`);
    doc.end();
  } catch (error) {
    console.error("Erro ao gerar contrato PDF:", error);
    res.status(500).send({ message: 'Erro no servidor ao gerar contrato', error: error.message });
  }
};