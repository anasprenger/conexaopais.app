const { query } = require('../config/database');

// Curtidas e conteúdos salvos (tabela public.interacoes do site, ligada ao slug da publicação).
// O site também registra "lido"; o app usa só curtida e salvo.

async function listarPorUsuario(usuarioId) {
  return query(
    `SELECT publicacao_slug AS "publicacaoSlug", tipo FROM public.interacoes
      WHERE user_id = $1 AND tipo IN ('curtida', 'salvo') ORDER BY created_at DESC`,
    [usuarioId]
  );
}

// Liga/desliga uma curtida ou um "salvo" e devolve a situação atualizada
async function alternar({ usuarioId, slug, tipo }) {
  const removidas = await query(
    'DELETE FROM public.interacoes WHERE user_id = $1 AND publicacao_slug = $2 AND tipo = $3 RETURNING id',
    [usuarioId, slug, tipo]
  );
  const ativo = removidas.length === 0;
  if (ativo) {
    await query(
      'INSERT INTO public.interacoes (user_id, publicacao_slug, tipo) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [usuarioId, slug, tipo]
    );
  }
  const [{ total }] = await query(
    'SELECT count(*) AS total FROM public.interacoes WHERE publicacao_slug = $1 AND tipo = $2',
    [slug, tipo]
  );
  return { publicacaoSlug: slug, tipo, ativo, total: Number(total) };
}

module.exports = { listarPorUsuario, alternar };
