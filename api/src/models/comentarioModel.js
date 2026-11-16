const { query } = require('../config/database');

// Comentários das publicações (tabela public.comentarios do site, ligada ao slug da publicação)
const SELECT_COMENTARIO = `
  SELECT c.id, c.publicacao_slug AS "publicacaoSlug", c.texto, c.created_at AS "criadoEm",
         c.user_id AS "usuarioId", coalesce(p.display_name, 'Participante') AS "autorNome"
    FROM public.comentarios c
    LEFT JOIN public.profiles p ON p.id = c.user_id`;

async function listarPorPublicacao(slug) {
  return query(`${SELECT_COMENTARIO} WHERE c.publicacao_slug = $1 ORDER BY c.created_at, c.id`, [slug]);
}

async function buscarPorId(id) {
  const linhas = await query(`${SELECT_COMENTARIO} WHERE c.id = $1`, [id]);
  return linhas[0] ?? null;
}

async function criar({ slug, usuarioId, texto }) {
  const [{ id }] = await query(
    'INSERT INTO public.comentarios (user_id, publicacao_slug, texto) VALUES ($1, $2, $3) RETURNING id',
    [usuarioId, slug, texto]
  );
  return buscarPorId(id);
}

async function excluir(id) {
  await query('DELETE FROM public.comentarios WHERE id = $1', [id]);
}

module.exports = { listarPorPublicacao, buscarPorId, criar, excluir };
