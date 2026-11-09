// Funções de apoio dos testes automatizados (npm test).
// Os testes sobem a API numa porta livre e usam o banco configurado no api/.env.
// Antes de rodar: MySQL ligado e "npm run db:setup" executado pelo menos uma vez.
const { once } = require('node:events');
const path = require('node:path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
// Se o .env ainda não tem segredo, os testes usam um próprio (só existe durante o teste)
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'segredo-usado-somente-nos-testes-automatizados-0123456789';

const app = require('../src/app');
const db = require('../src/config/database');

async function iniciarApi() {
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

  const status = await req('GET', '/status');
  if (status.dados?.banco !== 'ok') {
    servidor.close();
    await db.end();
    throw new Error('Banco indisponível. Ligue o MySQL, confira o api/.env e rode "npm run db:setup" antes dos testes.');
  }

  async function encerrar() {
    servidor.close();
    await db.end();
  }

  return { req, encerrar };
}

async function entrar(req, email, senha = '123456') {
  const { status, dados } = await req('POST', '/auth/login', { body: { email, senha } });
  if (status !== 200) throw new Error(`Login de ${email} falhou (${status}): ${dados?.erro}`);
  return dados;
}

// E-mail que não se repete entre execuções
function emailDeTeste(prefixo) {
  return `${prefixo}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@teste.conexaopais.test`;
}

// Remove as contas criadas no teste (artigos, comentários e interações delas saem em cascata)
async function apagarContas(ids) {
  if (ids.length) await db.query('DELETE FROM usuarios WHERE id IN (?)', [ids]);
}

const artigoValido = {
  titulo: 'Artigo criado pelos testes',
  categoria: 'Educação',
  resumo: 'Resumo com mais de vinte caracteres para a validação.',
  conteudo: 'Texto com mais de cinquenta caracteres, para passar na validação da API.',
  tags: ['Teste'],
};

module.exports = { iniciarApi, entrar, emailDeTeste, apagarContas, artigoValido, db };
