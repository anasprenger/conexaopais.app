// Banco de dados dos testes automatizados.
// Os testes NUNCA usam o banco do site. Cada arquivo de teste cria um PostgreSQL só dele, na memória
// (PGlite: o PostgreSQL de verdade rodando dentro do Node, sem instalar nada), com:
// 1. database/teste/supabase-simulado.sql: as peças do Supabase que um PostgreSQL comum não tem;
// 2. database/supabase/migrations: as migrations do site, sem alteração (mesmas tabelas, gatilhos e funções);
// 3. database/teste/dados-teste.sql: contas de teste (senha 123456).
// No fim do teste o banco some.
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const { pgcrypto } = require('@electric-sql/pglite/contrib/pgcrypto');
const { PGLiteSocketServer } = require('@electric-sql/pglite-socket');

const PASTA = path.join(__dirname, '..', '..', 'database');

function arquivosSql() {
  const migrations = fs
    .readdirSync(path.join(PASTA, 'supabase', 'migrations'))
    .filter((nome) => nome.endsWith('.sql'))
    .sort()
    .map((nome) => path.join(PASTA, 'supabase', 'migrations', nome));
  return [path.join(PASTA, 'teste', 'supabase-simulado.sql'), ...migrations, path.join(PASTA, 'teste', 'dados-teste.sql')];
}

// Cria o banco e o deixa acessível como um PostgreSQL comum (para o driver "pg" da API).
// Devolve a DATABASE_URL e a função que desliga tudo.
async function criarBancoDeTeste() {
  const banco = await PGlite.create({ extensions: { pgcrypto } });
  for (const arquivo of arquivosSql()) {
    try {
      await banco.exec(fs.readFileSync(arquivo, 'utf8'));
    } catch (erro) {
      throw new Error(`Falha ao preparar o banco de teste em ${path.basename(arquivo)}: ${erro.message}`);
    }
  }
  // O PGlite é uma sessão só do PostgreSQL: a API usa uma conexão durante os testes (DB_POOL_MAX=1),
  // para que as transações não se misturem
  const servidor = new PGLiteSocketServer({ db: banco, port: 0, host: '127.0.0.1' });
  await servidor.start();
  return {
    url: `postgres://postgres:postgres@${servidor.getServerConn()}/postgres`,
    async desligar() {
      await servidor.stop();
      await banco.close();
    },
  };
}

module.exports = { criarBancoDeTeste };
