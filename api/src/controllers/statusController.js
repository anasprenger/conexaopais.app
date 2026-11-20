const { query } = require('../config/database');
const { mensagemErroBanco } = require('../utils/erroBanco');

// GET /api/status — confere se a API e o banco (Supabase) estão respondendo
async function status(req, res) {
  try {
    await query('SELECT 1 FROM public.publicacoes LIMIT 1');
    res.json({ api: 'ok', banco: 'ok' });
  } catch (erro) {
    console.error('Banco indisponível:', mensagemErroBanco(erro));
    res.status(503).json({ api: 'ok', banco: 'indisponível' });
  }
}

module.exports = { status };
