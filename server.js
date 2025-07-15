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
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({ dest: 'uploads/' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função de atraso
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota de envio
app.post('/enviar-emails', upload.single('file'), async (req, res) => {
  try {
    const { subject, message } = req.body;
    const filePath = req.file.path;

    if (!filePath) return res.status(400).send('Arquivo da planilha não enviado.');

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    const emails = data.map(row => row.Email).filter(Boolean);

    if (emails.length === 0) {
      return res.status(400).send('Nenhum e-mail válido encontrado na planilha.');
    }

    let success = 0;
    let failed = 0;

    for (const [i, email] of emails.entries()) {
      try {
        await transporter.sendMail({
          from: `"Remetente" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: subject,
          text: message,
        });

        console.log(`(${i + 1}) E-mail enviado para: ${email}`);
        success++;
        await delay(2000); // 2 segundos entre envios
      } catch (err) {
        console.error(`Erro ao enviar para ${email}:`, err);
        failed++;
        await delay(1000); // atraso menor para falhas
      }
    }

    fs.unlinkSync(filePath);

    const msg = `Envio concluído. ✅ Sucesso: ${success} | ❌ Falhas: ${failed}. ${
      failed > 0
        ? 'Alguns e-mails não foram enviados. Tente novamente mais tarde.'
        : 'Todos os e-mails foram enviados com sucesso!'
    }`;

    res.send(msg);
  } catch (err) {
    console.error('Erro geral:', err);
    res.status(500).send('Erro ao processar os e-mails. Tente novamente mais tarde.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
