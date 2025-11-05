// server.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'verificador_qr';
const port = process.env.PORT || 3000;

let col;

// Conexión a Mongo con reintento (no mata el proceso en Render)
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

// ---------- UI (estilo formal, info centrada, paleta ULDC) ----------
function pageResult(doc, codeBuscado) {
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
  const exists  = !!doc;
  const statusText = isValid ? 'TÍTULO VÁLIDO'
                   : exists  ? 'TÍTULO ANULADO / NO VÁLIDO'
                             : 'TÍTULO NO REGISTRADO';
  const badge = isValid ? COLORS.ok : COLORS.bad;
  const emoji = isValid ? '✅' : '⛔';

  const code   = doc?.code ?? codeBuscado ?? '—';
  const cedula = doc?.cedula ?? '—';
  const cert   = doc?.certificado ?? doc?.taller ?? '—';
  const fecha  = doc?.fecha_emision ? new Date(doc.fecha_emision).toLocaleDateString('es-CR') : '—';
  const folio  = doc?.folio ?? '—';
  const upd    = doc?.last_update ? new Date(doc.last_update).toLocaleString('es-CR') : '—';

  const LOGO = process.env.LOGO_URL
    || 'https://upload.wikimedia.org/wikipedia/commons/8/89/OOjs_UI_icon_article-ltr.svg';

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Validador de Títulos | ULDC</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
:root{
  --vino:${COLORS.vino}; --vino2:${COLORS.vino2}; --azul:${COLORS.azul}; --amarillo:${COLORS.amarillo};
  --ok:${COLORS.ok}; --bad:${COLORS.bad}; --bg:${COLORS.bg}; --text:#1f2430; --muted:#5b6372; --card:#fff;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial;color:var(--text)}
/* Encabezado */
.topbar{position:sticky;top:0;z-index:10;background:linear-gradient(90deg,var(--vino),var(--azul));color:#fff}
.nav{max-width:980px;margin:0 auto;display:flex;align-items:center;gap:14px;height:68px;padding:0 16px}
.brand{display:flex;align-items:center;gap:12px;font-weight:800}
.brand-logo{
  height:40px;width:auto;
  background:#232673; /* placa oscura para logos claros */
  padding:6px 10px;border-radius:12px;
  box-shadow:0 0 0 2px rgba(255,255,255,.35), 0 8px 18px rgba(0,0,0,.15);
}
.navlinks{margin-left:auto;display:flex;gap:18px}
.navlinks a{color:#fff;text-decoration:none;opacity:.95}
.navlinks a:hover{opacity:1;text-decoration:underline}
.brandbar{height:4px;background:linear-gradient(90deg,var(--amarillo),var(--vino2),var(--azul))}

/* Cuerpo centrado y formal */
.main{max-width:760px;margin:28px auto;padding:0 16px}
.card{background:var(--card);border-radius:18px;box-shadow:0 22px 48px rgba(0,0,0,.10);overflow:hidden}
.status{background:${badge};color:#fff;text-align:center;padding:18px;font-weight:800;font-size:20px}
.body{padding:26px;text-align:center}
.kv{display:grid;grid-template-columns:1fr;gap:10px;margin:8px 0}
.row{display:grid;grid-template-columns:1fr;justify-items:center}
.k{font-size:11px;letter-spacing:.6px;text-transform:uppercase;color:var(--muted)}
.v{font-size:18px;font-weight:700}
.hr{height:1px;background:linear-gradient(90deg,transparent,rgba(0,0,0,.08),transparent);margin:14px 0}
.meta{margin-top:8px;color:var(--muted);font-size:12px}
.badge-soft{display:inline-block;background:#fafbff;border:1px solid #edf0f6;border-radius:999px;padding:6px 10px;font-size:12px;color:#3b4251}
.footer{padding:14px;text-align:center;color:#9aa1af;font-size:12px}
.btn{display:inline-block;border:0;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;text-decoration:none}
.btn-outline{background:#fff;color:var(--azul);outline:2px solid var(--azul)}
</style>
</head>
<body>

<header class="topbar">
  <div class="nav">
    <div class="brand">
      <img class="brand-logo" src="${LOGO}" alt="ULDC">
      <div>Universidad Escuela Libre de Derecho</div>
    </div>
    <nav class="navlinks">
      <a href="https://www.escuelalibre.cr" target="_blank" rel="noopener">Sitio ULDC</a>
    </nav>
  </div>
  <div class="brandbar"></div>
</header>

<main class="main">
  <div class="card">
    <div class="status">${emoji} ${statusText}</div>
    <div class="body">
      <div class="kv">
        <div class="row"><div class="k">Código</div><div class="v">${code}</div></div>
        <div class="row"><div class="k">Cédula</div><div class="v">${cedula}</div></div>
        <div class="row"><div class="k">Certificado / Taller</div><div class="v">${cert}</div></div>
      </div>

      <div class="hr"></div>

      <div class="kv">
        <div class="row"><div class="k">Fecha de emisión</div><div class="v">${fecha}</div></div>
        <div class="row"><div class="k">Folio</div><div class="v">${folio}</div></div>
      </div>

      <div class="meta">
        <span class="badge-soft">Última actualización: ${upd}</span>
      </div>

      <div style="margin-top:14px">
        <a class="btn btn-outline" href="https://www.escuelalibre.cr" target="_blank" rel="noopener">Ir al sitio ULDC</a>
      </div>
    </div>
    <div class="footer">© Universidad Escuela Libre de Derecho — Verificación de títulos</div>
  </div>
</main>

</body>
</html>`;
}

function pageForm() {
  const LOGO = process.env.LOGO_URL
    || 'https://upload.wikimedia.org/wikipedia/commons/8/89/OOjs_UI_icon_article-ltr.svg';
  return `<!doctype html>
<html lang="es">
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verificar | ULDC</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
:root{--vino:#49132C;--azul:#232673;--amarillo:#C8900E;--bg:#f5f6fa}
*{box-sizing:border-box}body{margin:0;background:var(--bg);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial}
.topbar{background:linear-gradient(90deg,var(--vino),var(--azul));color:#fff}
.nav{max-width:980px;margin:0 auto;display:flex;align-items:center;gap:14px;height:68px;padding:0 16px}
.brand{display:flex;align-items:center;gap:12px;font-weight:800}
.brand-logo{height:40px;width:auto;background:#232673;padding:6px 10px;border-radius:12px;box-shadow:0 0 0 2px rgba(255,255,255,.35), 0 8px 18px rgba(0,0,0,.15)}
.navlinks{margin-left:auto;display:flex;gap:18px}
.navlinks a{color:#fff;text-decoration:none;opacity:.95}
.navlinks a:hover{opacity:1;text-decoration:underline}
.brandbar{height:4px;background:linear-gradient(90deg,var(--amarillo),#942150,var(--azul))}
.wrap{max-width:760px;margin:28px auto;padding:0 16px}
.card{background:#fff;border-radius:16px;box-shadow:0 18px 40px rgba(0,0,0,.08);padding:22px;text-align:center}
label{display:block;margin:6px 0 8px;color:#475467;font-size:14px}
input{width:100%;padding:12px 14px;border:1px solid #e5e7eb;border-radius:12px;font-size:16px}
.actions{margin-top:14px;display:flex;gap:10px;justify-content:center}
.btn{border:0;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer}
.btn-primary{background:var(--azul);color:#fff}
</style>
<header class="topbar">
  <div class="nav">
    <div class="brand">
      <img class="brand-logo" src="${LOGO}" alt="ULDC">
      <div>Universidad Escuela Libre de Derecho</div>
    </div>
    <nav class="navlinks">
      <a href="https://www.escuelalibre.cr" target="_blank" rel="noopener">Sitio ULDC</a>
    </nav>
  </div>
  <div class="brandbar"></div>
</header>
<div class="wrap">
  <div class="card">
    <h1 style="margin:0 0 6px">Verificar un código</h1>
    <label for="code">Pega el código del título (ej. ULDC-2025-000200)</label>
    <input id="code" placeholder="ULDC-2025-000200" autocomplete="off">
    <div class="actions">
      <button class="btn btn-primary" onclick="go()">Verificar</button>
    </div>
  </div>
</div>
<script>
  function go(){
    const c = document.getElementById('code').value.trim();
    if(!c) return alert('Escribe un código');
    location.href = '/v/' + encodeURIComponent(c);
  }
  document.getElementById('code').addEventListener('keydown',e=>{
    if(e.key==='Enter') go();
  });
</script>
</html>`;
}

// Middleware guard (si Mongo aún conecta)
function guard(handler) {
  return async (req, res) => {
    if (!col) return res.status(503).send('Servicio iniciando, intenta en unos segundos…');
    return handler(req, res);
  };
}

// ---------- RUTAS ----------
app.get('/', (_req, res) => res.redirect(302, '/validar')); // sin "OK"

// /validar (si no hay id, muestra formulario centrado)
app.get('/validar', guard(async (req, res) => {
  const id = (req.query.id || '').trim();
  if (!id) return res.status(200).send(pageForm());
  const doc = await col.findOne({ code: id }, { projection: { _id: 0 } });
  res.status(doc && doc.status === 'valido' ? 200 : 404).send(pageResult(doc, id));
}));

// /v/:id (para QR)
app.get('/v/:id', guard(async (req, res) => {
  const id = (req.params.id || '').trim();
  const doc = await col.findOne({ code: id }, { projection: { _id: 0 } });
  res.status(doc && doc.status === 'valido' ? 200 : 404).send(pageResult(doc, id));
}));

app.listen(port, () => console.log(`Servidor en http://localhost:${port}`));

