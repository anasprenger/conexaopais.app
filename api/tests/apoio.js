// Funções de apoio dos testes automatizados (npm test).
// Cada arquivo de teste sobe a API numa porta livre, ligada a um banco de teste na memória (bancoDeTeste.js),
// com a mesma estrutura do banco do site. O banco do site e o arquivo api/.env NÃO são usados.
const { once } = require('node:events');
const { criarBancoDeTeste } = require('./bancoDeTeste');

process.env.JWT_SECRET = 'segredo-usado-somente-nos-testes-automatizados-0123456789';
process.env.JWT_EXPIRES_IN = '7d';
process.env.DB_POOL_MAX = '1';
process.env.SUPABASE_URL = 'http://supabase-dos-testes.invalid';
process.env.SUPABASE_PUBLISHABLE_KEY = 'chave-dos-testes';

// Ids das contas de teste (database/teste/dados-teste.sql)
const CONTAS = {
  admin: { id: '00000000-0000-4000-8000-000000000001', email: 'admin@conexaopais.test' },
  profissional: { id: '00000000-0000-4000-8000-000000000002', email: 'profissional@conexaopais.test' },
  familia: { id: '00000000-0000-4000-8000-000000000003', email: 'familia@conexaopais.test' },
  pendente: { id: '00000000-0000-4000-8000-000000000004', email: 'pendente@conexaopais.test' },
};

// Nos testes não há Supabase Auth de verdade. Este substituto faz o mesmo trabalho direto no banco de teste:
// confere a senha com o hash bcrypt (função crypt do PostgreSQL) e cria contas em auth.users,
// o que dispara o mesmo gatilho do site (handle_new_user) que cria perfil e nível.
function simularSupabaseAuth({ query }) {
  const supabaseAuth = require('../src/services/supabaseAuth');
  const HttpError = require('../src/utils/HttpError');

  supabaseAuth.entrar = async (email, senha) => {
    const [conta] = await query(
      `SELECT id, email_confirmed_at, banned_until FROM auth.users
        WHERE email = $1 AND encrypted_password = crypt($2, encrypted_password)`,
      [email, senha]
    );
    if (!conta) throw new HttpError(401, 'E-mail ou senha incorretos.');
    if (!conta.email_confirmed_at) throw new HttpError(401, 'Confirme seu e-mail antes de entrar.');
    if (conta.banned_until && conta.banned_until > new Date()) throw new HttpError(403, 'Esta conta está suspensa.');
    return { id: conta.id };
  };

  supabaseAuth.cadastrar = async ({ email, senha, nome, tipo, profissao, registro }) => {
    const [existente] = await query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (existente) throw new HttpError(409, 'Este e-mail já está cadastrado.', { email: 'Este e-mail já está cadastrado.' });
    const metadados = { display_name: nome, tipo_conta: tipo, ...(tipo === 'profissional' && { profissao, registro_profissional: registro }) };
    const [conta] = await query(
      `INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data)
       VALUES ($1, crypt($2, gen_salt('bf', 10)), $3) RETURNING id`,
      [email, senha, metadados]
    );
    return { id: conta.id, confirmarEmail: false };
  };
}

async function iniciarApi() {
  const banco = await criarBancoDeTeste();
  process.env.DATABASE_URL = banco.url;

  // Só depois de apontar DATABASE_URL para o banco de teste a API é carregada
  const app = require('../src/app');
  const db = require('../src/config/database');
  simularSupabaseAuth(db);

  const servidor = app.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  const base = `http://127.0.0.1:${servidor.address().port}/api`;

  // Requisição à API: devolve { status, dados }. "token" vai no cabeçalho Authorization como Bearer Token.
  async function req(method, caminho, { token, body, headers = {} } = {}) {
    const resposta = await fetch(`${base}${caminho}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null);
    return { status: resposta.status, dados };
  }

  async function encerrar() {
    servidor.close();
    await db.pool.end();
    await banco.desligar();
  }

  return { req, encerrar, query: db.query };
}

async function entrar(req, email, senha = '123456') {
  const { status, dados } = await req('POST', '/auth/login', { body: { email, senha } });
  if (status !== 200) throw new Error(`Login de ${email} falhou (${status}): ${dados?.erro}`);
  return dados;
}

let contador = 0;
function emailDeTeste(prefixo) {
  contador += 1;
  return `${prefixo}.${contador}@teste.conexaopais.test`;
}

const artigoValido = {
  titulo: 'Artigo criado pelos testes',
  categoria: 'Educação',
  resumo: 'Resumo com mais de vinte caracteres para a validação.',
  conteudo: 'Texto com mais de cinquenta caracteres, para passar na validação da API.',
};

module.exports = { iniciarApi, entrar, emailDeTeste, artigoValido, CONTAS };
