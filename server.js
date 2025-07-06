const dotenv = require('dotenv');
const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configurar transporte de e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get('/', (req, res) =>{
    res.send('Seu servidor está rodando, para enviar os emails, acesse a rota /enviar-emails');
});

// Enviar e-mails a partir de uma planilha
app.get('/enviar-emails', async (req, res) => {
  try {
    const filePath = './planilhas/teste.xlsx';

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Planilha não encontrada.');
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const emails = data.map(row => row.Email).filter(Boolean);

    for (const email of emails) {
      await transporter.sendMail({
        from: '"Nome do Remetente" derickcampossantos1@gmail.com',
        to: email,
        subject: 'Primeiro passo para o sucesso',
        text: 'Olá! Chegou a hora de dar um novo passo!',
      });

      console.log(`E-mail enviado para: ${email}`);
    }

    res.send(`E-mails enviados com sucesso para ${emails.length} destinatários.`);
  } catch (err) {
    console.error('Erro:', err);
    res.status(500).send('Erro ao processar os e-mails.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
