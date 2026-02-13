const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname);

// Хранение заявок в JSON-файле (без сборки нативных модулей)
const dataPath = path.join(__dirname, 'feedback.json');

function readFeedback() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function writeFeedback(list) {
  fs.writeFileSync(dataPath, JSON.stringify(list, null, 2), 'utf8');
}

app.use(express.json());
app.use(express.static(PUBLIC));

// Приём заявок
app.post('/api/feedback', (req, res) => {
  try {
    const { name, email, phone = '', type = 'other', message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Заполните обязательные поля: имя, e-mail и сообщение.',
      });
    }

    const list = readFeedback();
    const created = new Date().toLocaleString('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    list.unshift({
      id: list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1,
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().slice(0, 255),
      phone: String(phone).trim().slice(0, 30),
      type: ['collab', 'project', 'question', 'other'].includes(type) ? type : 'other',
      message: String(message).trim().slice(0, 2000),
      created_at: created,
    });

    writeFeedback(list);

    res.status(201).json({ success: true, message: 'Заявка принята! Спасибо.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера. Попробуйте позже.',
    });
  }
});

// Просмотр заявок
app.get('/api/feedback', (req, res) => {
  try {
    const list = readFeedback().slice(0, 500);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Ошибка сервера.' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log('Заявки сохраняются в файл feedback.json');
});
