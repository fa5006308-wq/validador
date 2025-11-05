// server.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'verificador_qr';
const port = process.env.PORT || 3000;

let col;

// Conexión a Mongo (con reintento para Render Free)
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
async function initMongo() {
  try {
    await client.connect();
    const db = client.db(dbName);
    col = db.collection('titulos');
    await col.createIndex({ code: 1 }, { unique: true });
    console.log('OK Mongo conectado');
  } catch (err) {
    console.error('Mongo init error:', err.message);
    setTimeout(initMongo, 15000);
  }
}
initMongo();

function html(doc, codeBuscado) {
  const COLORS = {
    vino: '#49132C',
    vino2: '#942150',
    azul: '#232673',
    amarillo: '#C8900E',
    ok: '#198754',
    bad: '#dc3545',
    bg: '#f5f6fa'
  };
  const isValid = !!doc && doc.status === 'valido';
  const statusText = isValid ? 'TÍTULO VÁLIDO' : 'TÍTULO NO VÁLIDO';
  const badge = isValid ? COLORS.ok : COLORS.bad;
  const emoji = isValid ? '✅' : '⛔';

  const cedula = doc?.cedula ?? '—';
  const cert = doc?.certificado ?? '—';
  const codeShown = doc?.code ?? codeBuscado ?? '—';
  const updated = doc?.last_update
    ? new Date(doc.last_update).toLocaleString('es-CR')
    : '—';

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Validador de Títulos | ULDC</title>
<style>
:root{
  --vino:${COLORS.vino}; --vino2:${COLORS.vino2};
  --azul:${COLORS.azul}; --amarillo:${COLORS.amarillo};
  --ok:${COLORS.ok}; --bad:${COLORS.bad}; --bg:${COLORS.bg};
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);font-family:system-ui,-apple-system,Inter,Roboto,Arial,sans-serif;color:#222}
header{
  background:linear-gradient(90deg,var(--vino),var(--azul));
  color:#fff; padding:12px 18px; display:flex; align-items:center; gap:12px
}
header .brand{display:flex; align-items:center; gap:12px; font-weight:800}
header .brand-logo{
  height:40px; width:auto;
  background:#fff;                 
  padding:6px 8px;               
  border-radius:12px;             
  box-shadow:0 0 0 2px rgba(255,255,255,.45), 0 6px 16px rgba(0,0,0,.15);
}

.status{
  background:${badge}; color:#fff; padding:18px; font-size:20px; font-weight:800; text-align:center
}
.body{padding:22px}
.kv{display:grid; grid-template-columns:180px 1fr; gap:8px 16px; margin-top:8px}
.kv .k{font-weight:700; color:#555}
.kv .v{font-weight:600}
.meta{margin-top:14px; color:#666; font-size:13px}
.actions{margin:18px 0 6px; display:flex; gap:10px; flex-wrap:wrap}
.btn{border:0; padding:10px 14px; border-radius:10px; cursor:pointer; font-weight:700}
.btn-primary{background:var(--azul); color:#fff}
.btn-outline{background:#fff; color:var(--azul); outline:2px solid var(--azul)}
.footer{padding:14px; text-align:center; color:#999; font-size:12px}
</style>
</head>
<body>
<header>
  <div class="brand">
   <img class="brand-logo"
     src="${process.env.LOGO_URL || 'https://sp-ao.shortpixel.ai/client/to_auto,q_glossy,ret_img,w_600/https://uescuelalibre.cr/wp-content/uploads/2020/03/Logo-blanco.png'}"
     alt="ULDC">

    <div>Universidad Escuela Libre de Derecho</div>
  </div>
  <nav class="navlinks">
  <a href="/validar">Verificar</a>
  <a href="https://www.escuelalibre.cr" target="_blank" rel="noopener">Sitio ULDC</a>
</nav>

</header>

<main class="main">
  <div class="card">
    <div class="status">${emoji} ${statusText}</div>
    <div class="body">
      <div class="kv">
        <div class="k">Código</div><div class="v">${codeShown}</div>
        <div class="k">Cédula</div><div class="v">${cedula}</div>
        <div class="k">Certificado</div><div class="v">${cert}</div>
      </div>
      <div class="actions">
        <a class="btn btn-primary" href="/validar">Verificar otro código</a>
        <a class="btn btn-outline" href="javascript:history.back()">Regresar</a>
      </div>
      <div class="meta">Última actualización: ${updated}</div>
    </div>
    <div class="footer">© ULDC</div>
  </div>
</main>
</body>
</html>`;
}

// Middleware de guardia mientras se inicializa Mongo
function guard(handler) {
  return async (req, res) => {
    if (!col) return res.status(503).send('Servicio iniciando, intenta en unos segundos…');
    return handler(req, res);
  };
}

app.get('/', (_req, res) => res.redirect(302, '/validar'));


// ?id=ULDC-2025-000200
app.get('/validar', guard(async (req, res) => {
  const id = (req.query.id || '').trim();
  if (!id) return res.status(400).send(html(null, '—'));
  const doc = await col.findOne({ code: id }, { projection: { _id: 0 } });
  res.status(doc && doc.status === 'valido' ? 200 : 404).send(html(doc, id));
}));

// /v/ULDC-2025-000200  => ideal para QR
app.get('/v/:id', guard(async (req, res) => {
  const id = (req.params.id || '').trim();
  const doc = await col.findOne({ code: id }, { projection: { _id: 0 } });
  res.status(doc && doc.status === 'valido' ? 200 : 404).send(html(doc, id));
}));

app.listen(port, () => console.log(`Servidor en http://localhost:${port}`));
