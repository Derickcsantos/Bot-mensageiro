// server.js
const dotenv = require('dotenv');
const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();
const PORT = 3000;

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configurar Multer para upload
const upload = multer({ dest: 'uploads/' });

// Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rota inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de envio de e-mails via POST
app.post('/enviar-emails', upload.single('file'), async (req, res) => {
  try {
    const { subject, message } = req.body;
    const filePath = req.file.path;

    if (!filePath) return res.status(400).send('Arquivo da planilha não enviado.');

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const emails = data.map(row => row.Email).filter(Boolean);

    for (const email of emails) {
      await transporter.sendMail({
        from: `"Remetente" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: message,
      });

      console.log(`E-mail enviado para: ${email}`);
    }

    // Apagar o arquivo depois do uso
    fs.unlinkSync(filePath);

    res.send(`E-mails enviados com sucesso para ${emails.length} destinatários.`);
  } catch (err) {
    console.error('Erro ao enviar e-mails:', err);
    res.status(500).send('Erro ao processar o envio de e-mails.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
