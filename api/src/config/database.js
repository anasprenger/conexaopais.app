const { Pool } = require('pg');

// Conexão com o banco do site: o PostgreSQL do projeto Conexão Pais no Supabase.
// O endereço completo (com a senha do banco) fica em DATABASE_URL, no arquivo .env (fora do Git).
// A API conecta como dona do banco, então as regras de acesso (RLS) do Supabase não se aplicam aqui:
// quem decide o que cada nível pode fazer são os middlewares da API (autenticacao.js e permissoes.js).

function precisaDeSsl(url) {
  if (process.env.DB_SSL === 'false') return false;
  if (process.env.DB_SSL === 'true') return true;
  // banco no próprio computador (testes) não usa SSL; o Supabase exige
  return !/@(localhost|127\.0\.0\.1)[:/]/.test(url ?? '');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Conexão criptografada. O certificado do Supabase não está na lista padrão do Node,
  // por isso a verificação da cadeia fica desligada (a conexão continua criptografada).
  ssl: precisaDeSsl(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_MAX || 5),
});

// Executa uma consulta e devolve as linhas. Os valores vão separados do SQL ($1, $2...),
// o que impede injeção de SQL.
async function query(sql, valores = []) {
  const { rows } = await pool.query(sql, valores);
  return rows;
}

// Executa várias consultas numa transação "em nome" de um usuário.
// Algumas funções e gatilhos do banco do site perguntam quem está agindo (auth.uid()).
// No Supabase essa informação vem do token; aqui a API informa o id de quem está logado.
async function comoUsuario(usuarioId, tarefa) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    await cliente.query("SELECT set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: usuarioId })]);
    const consultar = async (sql, valores = []) => (await cliente.query(sql, valores)).rows;
    const resultado = await tarefa(consultar);
    await cliente.query('COMMIT');
    return resultado;
  } catch (erro) {
    await cliente.query('ROLLBACK').catch(() => {});
    throw erro;
  } finally {
    cliente.release();
  }
}

module.exports = { pool, query, comoUsuario };
