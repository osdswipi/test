const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname);

// Подключение к PostgreSQL (Railway подставляет DATABASE_URL)
let db = null;
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });
}

// Создание таблицы при старте (если используем PostgreSQL)
async function initDb() {
  if (!db) return;
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        type TEXT NOT NULL DEFAULT 'other',
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Таблица feedback готова.');
  } catch (err) {
    console.error('Ошибка инициализации БД:', err.message);
  }
}

// Резерв: JSON-файл для локального запуска без БД
const dataPath = path.join(__dirname, 'feedback.json');

function readFeedbackFile() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function writeFeedbackFile(list) {
  fs.writeFileSync(dataPath, JSON.stringify(list, null, 2), 'utf8');
}

app.use(express.json());
app.use(express.static(PUBLIC));

// Приём заявок
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, phone = '', type = 'other', message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Заполните обязательные поля: имя, e-mail и сообщение.',
      });
    }

    const safeType = ['collab', 'project', 'question', 'other'].includes(type) ? type : 'other';
    const row = {
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().slice(0, 255),
      phone: String(phone).trim().slice(0, 30),
      type: safeType,
      message: String(message).trim().slice(0, 2000),
    };

    if (db) {
      await db.query(
        `INSERT INTO feedback (name, email, phone, type, message) VALUES ($1, $2, $3, $4, $5)`,
        [row.name, row.email, row.phone, row.type, row.message]
      );
    } else {
      const list = readFeedbackFile();
      const created = new Date().toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'medium' });
      list.unshift({
        id: list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1,
        ...row,
        created_at: created,
      });
      writeFeedbackFile(list);
    }

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
app.get('/api/feedback', async (req, res) => {
  try {
    if (db) {
      const result = await db.query(
        `SELECT id, name, email, phone, type, message, created_at FROM feedback ORDER BY id DESC LIMIT 500`
      );
      const data = result.rows.map((r) => ({
        ...r,
        created_at: r.created_at ? new Date(r.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'medium' }) : r.created_at,
      }));
      return res.json({ success: true, data });
    }
    const list = readFeedbackFile().slice(0, 500);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Ошибка сервера.' });
  }
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
    console.log(db ? 'Заявки сохраняются в PostgreSQL.' : 'Заявки сохраняются в feedback.json (нет DATABASE_URL).');
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
