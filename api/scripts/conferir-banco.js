// Confere se o api/.env está certo e se a API alcança o banco e as contas do site no Supabase.
// Uso: npm run db:conferir   (só lê, não altera nada)
require('dotenv').config({ quiet: true });

const { Pool } = require('pg');
const { mensagemErroBanco } = require('../src/utils/erroBanco');

async function conferirBanco() {
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: local ? false : { rejectUnauthorized: false }, max: 1 });
  try {
    const [publicacoes] = (await pool.query('SELECT count(*)::int AS total FROM public.publicacoes')).rows;
    const niveis = (await pool.query('SELECT role, count(*)::int AS total FROM public.user_roles GROUP BY role ORDER BY role')).rows;
    console.log(`✔ Banco do site conectado (${publicacoes.total} publicações no banco).`);
    console.log(`  Contas por papel: ${niveis.map((linha) => `${linha.role} ${linha.total}`).join(', ')}`);
    return true;
  } catch (erro) {
    console.error(`✖ Banco: ${mensagemErroBanco(erro)}`);
    return false;
  } finally {
    await pool.end();
  }
}

async function conferirAuth() {
  const url = (process.env.SUPABASE_URL ?? '').replace(/\/+$/, '');
  try {
    const resposta = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY } });
    if (!resposta.ok) throw new Error(`o Supabase respondeu ${resposta.status}; confira SUPABASE_PUBLISHABLE_KEY`);
    const config = await resposta.json();
    console.log('✔ Supabase Auth respondendo (contas do site).');
    console.log(
      config.mailer_autoconfirm
        ? '  Cadastro: contas novas entram na hora (sem confirmação de e-mail).'
        : '  Cadastro: contas novas precisam confirmar o e-mail antes do primeiro login.'
    );
    return true;
  } catch (erro) {
    console.error(`✖ Supabase Auth: ${erro.message}`);
    return false;
  }
}

(async () => {
  const faltando = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'JWT_SECRET'].filter((nome) => !process.env[nome]);
  if (faltando.length) {
    console.error(`✖ Faltam no api/.env: ${faltando.join(', ')}. Copie o .env.example e preencha (README, "Como rodar").`);
    process.exit(1);
  }
  const resultados = [await conferirBanco(), await conferirAuth()];
  process.exit(resultados.every(Boolean) ? 0 : 1);
})();
