require('dotenv').config();
const { MongoClient } = require('mongodb');

(async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'verificador_qr');
    const col = db.collection('titulos');

    await col.createIndex({ code: 1 }, { unique: true });

    const docs = [
      { code: 'ULDC-2025-000134', status: 'valido',  last_update: new Date() },
      { code: 'ULDC-2025-000135', status: 'anulado', last_update: new Date() }
    ];

    for (const d of docs) {
      await col.updateOne({ code: d.code }, { $set: d }, { upsert: true });
      console.log('Upsert OK:', d.code);
    }
    await client.close();
    console.log('Seed listo.');
  } catch (e) {
    console.error('Error seed:', e.message);
    process.exit(1);
  }
})();
