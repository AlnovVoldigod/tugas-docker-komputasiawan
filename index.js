const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

app.use(express.urlencoded({ extended: true }));

const dbConfig = {
  host: process.env.DB_HOST || 'database',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'noval_user',
  password: process.env.DB_PASSWORD || 'NovalPassword123!',
  database: process.env.DB_DATABASE || 'noval_db'
};

async function initDB() {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('CREATE TABLE IF NOT EXISTS catatan (id INT AUTO_INCREMENT PRIMARY KEY, isi VARCHAR(255) NOT NULL, waktu TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
  await conn.end();
}

app.get('/', async (req, res) => {
  try {
    await initDB();
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM catatan ORDER BY id DESC');
    await conn.end();

    const items = rows.map(r => '<li><b>' + r.isi + '</b> <small>(' + r.waktu + ')</small></li>').join('');
    res.send('<!DOCTYPE html><html><head><title>Tugas Docker - Moch Noval Eka Saputra</title><style>body{font-family:Arial,sans-serif;max-width:650px;margin:40px auto;padding:20px;background:#f4f6f9}.card{background:white;padding:25px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}input[type=text]{width:70%;padding:10px;border:1px solid #ccc;border-radius:4px}button{padding:10px 15px;background:#0066cc;color:white;border:none;border-radius:4px;cursor:pointer}li{margin:8px 0;padding:10px;background:#eef3f8;border-radius:4px}</style></head><body><div class="card"><h2>Aplikasi Catatan Cloud - Moch Noval Eka Saputra</h2><form method="POST" action="/add"><input type="text" name="isi" placeholder="Masukkan data baru..." required /><button type="submit">Simpan Data</button></form><h3>Data Tersimpan di Database MySQL:</h3><ul>' + (items || '<li>Belum ada data.</li>') + '</ul></div></body></html>');
  } catch (err) {
    res.status(500).send('Menunggu database MySQL siap: ' + err.message);
  }
});

app.post('/add', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('INSERT INTO catatan (isi) VALUES (?)', [req.body.isi]);
  await conn.end();
  res.redirect('/');
});

app.listen(3000, '0.0.0.0', () => console.log('Server berjalan pada port 3000'));
