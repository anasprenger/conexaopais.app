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
         ${NIVEL} AS nivel,
         coalesce(array_agg(r.role::text ORDER BY r.role) FILTER (WHERE r.role IS NOT NULL), '{}') AS papeis,
         u.last_sign_in_at AS "ultimoAcesso"
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
    papeis: linha.papeis,
    criadoEm: linha.criadoEm,
    ultimoAcesso: linha.ultimoAcesso ?? null,
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

// Quantas contas de administração existem (para ninguém deixar o site e o app sem administração)
async function totalDeAdmins() {
  const [linha] = await query("SELECT count(DISTINCT user_id)::int AS total FROM public.user_roles WHERE role = 'admin'");
  return linha.total;
}

// Liga ou desliga um papel (profissional ou admin), como a página "Usuários" do site.
// Profissional liberado pela administração já fica aprovado para publicar.
async function definirPapel({ id, papel, ativo, adminId }) {
  await comoUsuario(adminId, async (consultar) => {
    if (ativo) {
      await consultar(
        'INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO NOTHING',
        [id, papel]
      );
      if (papel === 'profissional') {
        await consultar(
          "UPDATE public.profiles SET verificacao = 'aprovado', verificado_em = now(), verificado_por = $2 WHERE id = $1",
          [id, adminId]
        );
      }
    } else {
      await consultar('DELETE FROM public.user_roles WHERE user_id = $1 AND role = $2', [id, papel]);
    }
  });
  return buscarPorId(id);
}

// Suspende ou reativa a conta, como o site: bloqueia o login no Supabase Auth (banned_until, sem prazo)
// e marca o perfil como "suspenso", o que tira a pessoa das listas públicas (profissionais, autores).
async function definirSuspensao({ id, suspensa, adminId }) {
  await comoUsuario(adminId, async (consultar) => {
    await consultar(
      "UPDATE auth.users SET banned_until = CASE WHEN $2 THEN now() + interval '876000 hours' ELSE NULL END WHERE id = $1",
      [id, suspensa]
    );
    await consultar('UPDATE public.profiles SET status = $2 WHERE id = $1', [id, suspensa ? 'suspenso' : 'ativo']);
  });
  return buscarPorId(id);
}

// Exclui a conta de vez. O banco apaga junto (ON DELETE CASCADE) perfil, papéis, publicações, comentários,
// curtidas e salvos. Os arquivos no Storage (foto de perfil, PDFs) ficam: o Supabase não deixa apagá-los
// pelo banco; o site apaga ao excluir pela página dele.
async function excluir(id) {
  await query('DELETE FROM auth.users WHERE id = $1', [id]);
}

module.exports = {
  buscarPorId,
  listar,
  atualizarVerificacao,
  totalDeAdmins,
  definirPapel,
  definirSuspensao,
  excluir,
  ehUuid,
};
