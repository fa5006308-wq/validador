// === UI con paleta ULDC (vino, azul, amarillo) ===
// Paleta desde tus muestras: #942150, #49132C, #232673, #C8900E
const LOGO_URL = process.env.LOGO_URL || "https://raw.githubusercontent.com/enchilada-dev/assets/main/uldc_logo_placeholder.png";

function renderPage(doc, exists) {
  const isValid = exists && (doc.status === 'valido');
  const estadoTxt = isValid ? 'TÍTULO VÁLIDO' : (exists ? 'TÍTULO ANULADO / NO VÁLIDO' : 'TÍTULO NO REGISTRADO');
  const badgeBg = isValid ? '#198754' : '#dc3545';
  const emoji = isValid ? '✅' : '⛔';

  // Campos (con tolerancia de nombres)
  const code        = doc?.code || '';
  const nombre      = doc?.nombre || '';
  const cedula      = doc?.cedula || '';
  const certificado = doc?.certificado || doc?.taller || doc?.grado || '';
  const carrera     = doc?.carrera || '';
  const folio       = doc?.folio || '';
  const pdf_url     = doc?.pdf_url || '';
  const fechaEmi    = doc?.fecha_emision ? new Date(doc.fecha_emision).toLocaleDateString('es-CR') : '';
  const ultimaAct   = doc?.last_update ? new Date(doc.last_update).toLocaleDateString('es-CR') : '';

  const pdfLink = pdf_url ? `<a class="link" href="${pdf_url}" target="_blank" rel="noopener">Ver documento</a>` : '—';

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verificación | Escuela Libre de Derecho</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
:root{
  --vino:#942150; --vino-osc:#49132C; --azul:#232673; --amarillo:#C8900E;
  --ok:#198754; --bad:#dc3545; --bg:#f5f6fb; --text:#1f2937; --muted:#475467; --card:#ffffff;
}
*{box-sizing:border-box} body{margin:0;background:var(--bg);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--text)}
.topbar{position:sticky;top:0;z-index:10;background:linear-gradient(90deg,var(--vino) 0%,var(--azul) 100%);color:#fff}
.container{max-width:1100px;margin:0 auto;padding:0 16px}
.nav{display:flex;align-items:center;justify-content:space-between;height:64px}
.brand{display:flex;align-items:center;gap:12px;font-weight:800;letter-spacing:.2px}
.brand img{height:38px;width:auto}
.brand span{font-size:18px}
.navlinks{display:flex;gap:18px}
.navlinks a{color:#fff;text-decoration:none;opacity:.95}
.navlinks a:hover{opacity:1;text-decoration:underline}
.main{padding:26px 0}
.card{background:var(--card);border-radius:16px;box-shadow:0 14px 30px rgba(0,0,0,.08);padding:22px}
.header{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.badge{display:inline-flex;align-items:center;gap:8px;background:${badgeBg};color:#fff;border-radius:12px;padding:12px 14px;font-weight:800}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:8px}
.item{background:#fafbff;border:1px solid #edf0f6;border-radius:12px;padding:12px}
.label{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
.value{font-weight:600}
.link{color:var(--azul);text-decoration:none}
.link:hover{text-decoration:underline}
.cta{margin-top:18px;display:flex;gap:10px;flex-wrap:wrap}
.btn{display:inline-block;border:0;border-radius:10px;padding:10px 14px;font-weight:700;text-decoration:none;cursor:pointer}
.btn-primary{background:var(--azul);color:#fff}
.btn-ghost{background:transparent;color:var(--azul);border:1px solid var(--azul)}
.footer{margin-top:18px;color:var(--muted);font-size:13px}
.small{font-size:13px;color:var(--muted)}
.kv{display:grid;grid-template-columns:140px 1fr;gap:8px}
.brandbar{height:4px;background:linear-gradient(90deg,var(--amarillo) 0,var(--vino) 40%,var(--azul) 100%);border-radius:0 0 8px 8px}
</style>
</head>
<body>

<header class="topbar">
  <div class="container nav">
    <div class="brand">
      <img src="${LOGO_URL}" alt="Logo ULDC">
      <span>Universidad Escuela Libre de Derecho</span>
    </div>
    <nav class="navlinks">
      <a href="/">Inicio</a>
      <a href="/validar">Verificar</a>
      <a href="https://www.escuelalibre.cr" target="_blank" rel="noopener">Sitio ULDC</a>
    </nav>
  </div>
  <div class="brandbar"></div>
</header>

<main class="container main">
  <div class="card">
    <div class="header">
      <div class="badge">${emoji} ${estadoTxt}</div>
    </div>

    <div class="grid">
      <div class="item"><div class="label">Código</div><div class="value">${code || '—'}</div></div>
      <div class="item"><div class="label">Cédula</div><div class="value">${cedula || '—'}</div></div>
      <div class="item"><div class="label">Estudiante</div><div class="value">${nombre || '—'}</div></div>
      <div class="item"><div class="label">Certificado / Taller</div><div class="value">${certificado || '—'}</div></div>
      <div class="item"><div class="label">Carrera</div><div class="value">${carrera || '—'}</div></div>
      <div class="item"><div class="label">Folio</div><div class="value">${folio || '—'}</div></div>
      <div class="item"><div class="label">Fecha de emisión</div><div class="value">${fechaEmi || '—'}</div></div>
      <div class="item"><div class="label">Última actualización</div><div class="value">${ultimaAct || '—'}</div></div>
      <div class="item"><div class="label">Documento</div><div class="value">${pdfLink}</div></div>
    </div>

    <div class="cta">
      <a class="btn btn-primary" href="/validar">Verificar otro código</a>
      ${code ? `<a class="btn btn-ghost" href="/v/${encodeURIComponent(code)}" target="_blank">Enlace directo a este código</a>` : ``}
    </div>

    <div class="footer small">
      * Si algún dato no coincide, comuníquese con el Registro Académico de la ULDC.
    </div>
  </div>
</main>

</body>
</html>`;
}

// === RUTAS que usan la interfaz ===

// /validar?id=CODIGO  (acepta querystring)
app.get('/validar', async (req, res) => {
  try {
    const id = (req.query.id || '').trim();
    if (!id) return res.status(400).send(renderPage(null, false));
    const doc = await col.findOne({ code: id }, { projection: { _id:0 } });
    const exists = !!doc;
    return res.status(exists && doc.status === 'valido' ? 200 : 404)
              .send(renderPage(doc, exists));
  } catch (e) {
    console.error(e);
    return res.status(500).send(renderPage(null, false));
  }
});

// /v/CODIGO  (ruta corta para QR)
app.get('/v/:id', async (req, res) => {
  try {
    const id = (req.params.id || '').trim();
    const doc = await col.findOne({ code: id }, { projection: { _id:0 } });
    const exists = !!doc;
    return res.status(exists && doc.status === 'valido' ? 200 : 404)
              .send(renderPage(doc, exists));
  } catch (e) {
    console.error(e);
    return res.status(500).send(renderPage(null, false));
  }
});

