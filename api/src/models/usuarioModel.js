const { comoUsuario, query } = require('../config/database');

// Usuários: são as contas do site. Os dados ficam em três tabelas do banco do Supabase:
// - auth.users: e-mail e hash da senha (cuidada pelo Supabase Auth);
// - public.profiles: nome, profissão, registro e situação da verificação profissional;
// - public.user_roles: níveis (usuario, profissional, admin). Uma conta pode ter mais de um papel;
//   o nível considerado é o mais alto (admin > profissional > usuario).

const NIVEL = `
  CASE
    WHEN bool_or(r.role = 'admin') THEN 'admin'
    WHEN bool_or(r.role = 'profissional') THEN 'profissional'
    ELSE 'usuario'
  END`;

const SELECT_USUARIO = `
  SELECT u.id, u.email, u.created_at AS "criadoEm",
         coalesce(p.display_name, split_part(u.email, '@', 1)) AS nome,
         p.profissao, p.registro_profissional AS "registroProfissional",
         coalesce(p.verificacao, 'aprovado') AS verificacao,
         (u.banned_until IS NOT NULL AND u.banned_until > now()) OR coalesce(p.status, 'ativo') <> 'ativo' AS suspensa,
         ${NIVEL} AS nivel
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    LEFT JOIN public.user_roles r ON r.user_id = u.id`;

const AGRUPAR = 'GROUP BY u.id, p.id';

function ehUuid(valor) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(valor ?? ''));
}

// Campos que saem na resposta da API (nunca o hash da senha)
function formatar(linha) {
  if (!linha) return null;
  return {
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    nivel: linha.nivel,
    profissao: linha.profissao,
    registroProfissional: linha.registroProfissional,
    verificacao: linha.verificacao,
    suspensa: linha.suspensa,
    criadoEm: linha.criadoEm,
  };
}

async function buscarPorId(id) {
  if (!ehUuid(id)) return null;
  const linhas = await query(`${SELECT_USUARIO} WHERE u.id = $1 ${AGRUPAR}`, [id]);
  return formatar(linhas[0]);
}

async function listar({ nivel, verificacao } = {}) {
  const filtros = [];
  const valores = [];
  if (verificacao) {
    valores.push(verificacao);
    filtros.push(`coalesce(p.verificacao, 'aprovado') = $${valores.length}`);
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  let having = '';
  if (nivel) {
    valores.push(nivel);
    having = `HAVING ${NIVEL} = $${valores.length}`;
  }
  const linhas = await query(`${SELECT_USUARIO} ${where} ${AGRUPAR} ${having} ORDER BY u.created_at DESC`, valores);
  return linhas.map(formatar);
}

// Decisão da administração sobre um cadastro profissional (mesma atualização que o site faz).
// Roda "em nome" de quem decide: o gatilho protect_profile_verification_fields do banco só aceita
// mudar a verificação se quem age for admin.
async function atualizarVerificacao({ id, verificacao, adminId }) {
  await comoUsuario(adminId, (consultar) =>
    consultar(
      'UPDATE public.profiles SET verificacao = $1, verificado_em = now(), verificado_por = $2 WHERE id = $3',
      [verificacao, adminId, id]
    )
  );
  return buscarPorId(id);
}

module.exports = { buscarPorId, listar, atualizarVerificacao, ehUuid };
