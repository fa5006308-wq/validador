require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'verificador_qr';
const port = process.env.PORT || 3000;

let col;

(async () => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    col = db.collection('titulos');
    await col.createIndex({ code: 1 }, { unique: true });
    console.log('OK Mongo conectado');
  } catch (err) {
    console.error('Mongo error:', err.message);
    process.exit(1);
  }
})();

function page(statusText, isValid) {
  const bg = isValid ? '#198754' : '#dc3545';
  const emoji = isValid ? '✅' : '⛔';
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verificación</title>
<style>
  :root{--ok:#198754;--bad:#dc3545;--bg:#f4f6f8}
  body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:var(--bg);font-family:system-ui,-apple-system,Inter,Roboto,Arial,sans-serif}
  .box{background:#fff;min-width:320px;max-width:520px;width:92vw;border-radius:16px;box-shadow:0 16px 32px rgba(0,0,0,.08);padding:28px;text-align:center}
  .badge{display:inline-block;background:${bg};color:#fff;border-radius:12px;padding:14px 18px;font-size:22px;font-weight:800}
  .emoji{font-size:26px;margin-right:10px}
</style></head>
<body>
  <div class="box"><div class="badge"><span class="emoji">${emoji}</span>${statusText}</div></div>
</body></html>`;
}

app.get('/validar', async (req, res) => {
  const id = (req.query.id || '').trim();
  if (!id) return res.status(400).send(page('TÍTULO NO VÁLIDO', false));
  try {
    const doc = await col.findOne({ code: id }, { projection: { status: 1, _id: 0 } });
    if (doc && doc.status === 'valido') return res.send(page('TÍTULO VÁLIDO', true));
    return res.status(404).send(page('TÍTULO NO VÁLIDO', false));
  } catch (e) {
    console.error(e);
    return res.status(500).send(page('TÍTULO NO VÁLIDO', false));
  }
});

app.get('/', (_req, res) => res.send('OK'));
app.listen(port, () => console.log(`Servidor en http://localhost:${port}`));

