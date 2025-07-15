// public/main.js
document.getElementById('email-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData();

  formData.append('subject', form.subject.value);
  formData.append('message', form.message.value);
  formData.append('file', form.file.files[0]);

  const status = document.getElementById('status');
  status.textContent = 'Enviando e-mails... aguarde.';

  try {
    const response = await fetch('/enviar-emails', {
      method: 'POST',
      body: formData,
    });

    const text = await response.text();
    status.textContent = text;
  } catch (err) {
    status.textContent = 'Erro ao enviar e-mails.';
    console.error(err);
  }
});


document.getElementById('file').addEventListener('change', function (event) {
  const file = event.target.files[0];
  const label = document.getElementById('file-label');

  if (file) {
    label.textContent = `📄 ${file.name}`;
  } else {
    label.textContent = 'Selecione um arquivo';
  }
});
