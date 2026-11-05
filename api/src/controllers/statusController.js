const db = require('../config/database');

// GET /api/status — confere se a API e o banco estão respondendo
async function status(req, res) {
  try {
    await db.query('SELECT 1');
    res.json({ api: 'ok', banco: 'ok' });
  } catch (erro) {
    console.error('MySQL indisponível:', erro.message);
    res.status(503).json({ api: 'ok', banco: 'indisponível' });
  }
}

module.exports = { status };
